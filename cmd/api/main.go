package main

import (
	"log"

	"github.com/baheroz2003/zorvyn-assignment/internal/config"
	"github.com/baheroz2003/zorvyn-assignment/internal/database"
	"github.com/baheroz2003/zorvyn-assignment/internal/handler"
	"github.com/baheroz2003/zorvyn-assignment/internal/middleware"
	"github.com/baheroz2003/zorvyn-assignment/internal/repository"
	"github.com/baheroz2003/zorvyn-assignment/internal/service"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func main() {
	// load config
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config load failed: %v", err)
	}

	// init logger
	var logger *zap.Logger
	if cfg.Env == "production" {
		logger, err = zap.NewProduction(zap.AddStacktrace(zap.FatalLevel))
	} else {
		logger, err = zap.NewDevelopment(zap.AddStacktrace(zap.FatalLevel))
	}
	if err != nil {
		log.Fatalf("logger init failed: %v", err)
	}
	defer logger.Sync()

	// connect to db
	db, err := database.Connect(cfg.DatabaseDSN)
	if err != nil {
		logger.Fatal("db connect failed", zap.Error(err))
	}
	defer db.Close()

	if err := database.Migrate(db); err != nil {
		logger.Fatal("migration failed", zap.Error(err))
	}

	// init repos
	userRepo := repository.NewUserRepository(db)
	tokenRepo := repository.NewRefreshTokenRepository(db)
	recordRepo := repository.NewRecordRepository(db)

	// init services
	authService := service.NewAuthService(userRepo, tokenRepo, cfg, logger)
	userService := service.NewUserService(userRepo, logger)
	recordService := service.NewRecordService(recordRepo, logger)
	dashboardService := service.NewDashboardService(recordRepo, logger)

	// init handlers + dependency injection
	authHandler := handler.NewAuthHandler(authService, logger)
	userHandler := handler.NewUserHandler(userService, tokenRepo, logger)
	recordHandler := handler.NewRecordHandler(recordService, logger)
	dashboardHandler := handler.NewDashboardHandler(dashboardService, logger)

	// router
	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()
	router.Use(middleware.ZapLogger(logger))
	router.Use(middleware.ErrorHandler(logger))
	router.Use(middleware.Recovery(logger))

	// health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	api := router.Group("/api/v1")

	// public routes
	auth := api.Group("/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
		auth.POST("/refresh", authHandler.Refresh)

		// logout needs a valid access token to know which refresh token to revoke
		auth.POST("/logout", middleware.Auth(cfg), authHandler.Logout)
	}

	// protected routes
	protected := api.Group("")
	protected.Use(middleware.Auth(cfg))

	// Users: admin manages others; any authenticated user can view themselves
	users := protected.Group("/users")
	{
		users.GET("", middleware.RequireRole("admin"), userHandler.ListUsers)
		users.GET("/:id", middleware.RequireRoleOrSelf("admin"), userHandler.GetUser)
		users.PATCH("/:id/role", middleware.RequireRole("admin"), userHandler.UpdateRole)
		users.PATCH("/:id/status", middleware.RequireRole("admin"), userHandler.UpdateStatus)
	}

	// Financial records
	records := protected.Group("/records")
	{
		// viewer + analyst + admin can list and get
		records.GET("", recordHandler.ListRecords)
		records.GET("/:id", recordHandler.GetRecord)

		// analyst and admin can create
		records.POST("", middleware.RequireRole("analyst", "admin"), recordHandler.CreateRecord)

		// only admin can modify or delete
		records.PUT("/:id", middleware.RequireRole("admin"), recordHandler.UpdateRecord)
		records.DELETE("/:id", middleware.RequireRole("admin"), recordHandler.DeleteRecord)
	}

	// Dashboard analytics - analyst and admin only
	dashboard := protected.Group("/dashboard")
	dashboard.Use(middleware.RequireRole("analyst", "admin"))
	{
		dashboard.GET("/summary", dashboardHandler.GetSummary)
		dashboard.GET("/trends", dashboardHandler.GetTrends)
		dashboard.GET("/categories", dashboardHandler.GetCategoryTotals)
		dashboard.GET("/recent", dashboardHandler.GetRecentActivity)
	}

	// Start server
	logger.Info("server starting", zap.String("port", cfg.Port), zap.String("env", cfg.Env))
	if err := router.Run(":" + cfg.Port); err != nil {
		logger.Fatal("server exited with error", zap.Error(err))
	}
}
