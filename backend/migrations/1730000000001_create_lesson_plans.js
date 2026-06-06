/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('lesson_plans', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: '"users"(id)',
      onDelete: 'CASCADE',
    },
    age_group: { type: 'text', notNull: true, check: "age_group IN ('2-3','3-4','4-5','5-6')" },
    theme: { type: 'text', notNull: true },
    lesson_content: { type: 'jsonb', notNull: true },
    source: { type: 'text', notNull: true, check: "source IN ('gemini','fallback')" },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('lesson_plans', ['user_id', 'created_at'], { order: 'DESC' });
  pgm.createIndex('lesson_plans', ['user_id', 'theme']);
};

exports.down = (pgm) => {
  pgm.dropTable('lesson_plans');
};
