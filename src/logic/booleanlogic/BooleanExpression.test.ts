import BooleanExpression, { Op } from './BooleanExpression';

test('flattenFalse', () => {
    const expr = new BooleanExpression([], Op.Or);

    expect(expr.flatten()).toMatchInlineSnapshot(`
      BooleanExpression {
        "items": [],
        "type": "or",
      }
    `);
});

test('removeDuplicateChildrenFalse', () => {
    const expr = new BooleanExpression([], Op.Or);

    // This is wrong
    expect(expr.removeDuplicateChildren((a, b) => a === b))
        .toMatchInlineSnapshot(`
          BooleanExpression {
            "items": [],
            "type": "and",
          }
        `);
});

test('flattenAnother', () => {
    const expr = new BooleanExpression(
        [new BooleanExpression([], Op.And)],
        Op.Or,
    );

    // This is wrong
    expect(expr.flatten()).toMatchInlineSnapshot(`
      BooleanExpression {
        "items": [],
        "type": "or",
      }
    `);
});
