exports.up = function(knex) {
  return knex.schema
    .createTable('users', (table) => {
      table.text('id').primary(); // UUID generated in JS
      table.string('email', 255).unique().notNullable().index();
      table.string('password_hash', 255).notNullable();
      table.string('role', 20).notNullable().default('viewer'); // validated in app
      table.string('status', 20).notNullable().default('active'); // validated in app
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('refresh_tokens', (table) => {
      table.text('id').primary(); // UUID in JS
      table.text('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('token_hash', 255).notNullable().unique();
      table.timestamp('expires_at').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('financial_records', (table) => {
      table.text('id').primary(); // UUID in JS
      table.float('amount').notNullable();
      table.string('category', 100).notNullable();
      table.text('description');
      table.text('created_by').notNullable().references('id').inTable('users');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.index(['created_by']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('financial_records')
    .dropTableIfExists('refresh_tokens')
    .dropTableIfExists('users');
};
