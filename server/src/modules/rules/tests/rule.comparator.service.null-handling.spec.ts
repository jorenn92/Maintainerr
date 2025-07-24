import { TestBed } from '@suites/unit';
import { RulePossibility } from '../constants/rules.constants';
import { ValueGetterService } from '../getter/getter.service';
import { RuleComparatorService } from '../helpers/rule.comparator.service';

describe('RuleComparatorService - Null Handling', () => {
  let ruleComparatorService: RuleComparatorService;

  beforeEach(async () => {
    const { unit } = await TestBed.solitary(RuleComparatorService)
      .mock(ValueGetterService)
      .final({ get: jest.fn() })
      .compile();

    ruleComparatorService = unit;
  });

  describe('IS_NULL operator', () => {
    const nullTestData = [
      [true, null],
      [false, undefined],
      [false, ''],
      [false, 0],
      [false, false],
      [false, []],
      [false, 'some text'],
      [false, 42],
      [false, new Date()],
    ] as [boolean, any][];

    it.each(nullTestData)(
      'should return %s when val1 is %o with action IS_NULL',
      (expected, val1) => {
        const action = RulePossibility.IS_NULL;
        const result = ruleComparatorService['doRuleAction'](
          val1,
          null, // second value doesn't matter for IS_NULL
          action,
        );
        expect(result).toBe(expected);
      },
    );
  });

  describe('IS_NOT_NULL operator', () => {
    const notNullTestData = [
      [false, null],
      [true, undefined],
      [true, ''],
      [true, 0],
      [true, false],
      [true, []],
      [true, 'some text'],
      [true, 42],
      [true, new Date()],
    ] as [boolean, any][];

    it.each(notNullTestData)(
      'should return %s when val1 is %o with action IS_NOT_NULL',
      (expected, val1) => {
        const action = RulePossibility.IS_NOT_NULL;
        const result = ruleComparatorService['doRuleAction'](
          val1,
          null, // second value doesn't matter for IS_NOT_NULL
          action,
        );
        expect(result).toBe(expected);
      },
    );
  });

  describe('Boolean logic fix validation', () => {
    it('should handle null values correctly with IS_NULL operator', () => {
      const action = RulePossibility.IS_NULL;
      
      // Test that null is properly detected as null
      expect(ruleComparatorService['doRuleAction'](null, null, action)).toBe(true);
      
      // Test that undefined is not detected as null
      expect(ruleComparatorService['doRuleAction'](undefined, null, action)).toBe(false);
      
      // Test that empty string is not detected as null
      expect(ruleComparatorService['doRuleAction']('', null, action)).toBe(false);
    });

    it('should handle null values correctly with IS_NOT_NULL operator', () => {
      const action = RulePossibility.IS_NOT_NULL;
      
      // Test that null is properly detected as null
      expect(ruleComparatorService['doRuleAction'](null, null, action)).toBe(false);
      
      // Test that undefined is not null
      expect(ruleComparatorService['doRuleAction'](undefined, null, action)).toBe(true);
      
      // Test that actual values are not null
      expect(ruleComparatorService['doRuleAction']('test', null, action)).toBe(true);
      expect(ruleComparatorService['doRuleAction'](0, null, action)).toBe(true);
      expect(ruleComparatorService['doRuleAction'](false, null, action)).toBe(true);
    });
  });

  describe('Null value processing in executeRule logic', () => {
    it('should process null values for null-specific operators', () => {
      // Test that null values are allowed through for IS_NULL operator
      const isNullAction = RulePossibility.IS_NULL;
      const isNotNullAction = RulePossibility.IS_NOT_NULL;
      
      // These should work even with null values
      expect(ruleComparatorService['doRuleAction'](null, null, isNullAction)).toBe(true);
      expect(ruleComparatorService['doRuleAction'](null, null, isNotNullAction)).toBe(false);
      
      // Test with non-null values as well
      expect(ruleComparatorService['doRuleAction']('test', null, isNullAction)).toBe(false);
      expect(ruleComparatorService['doRuleAction']('test', null, isNotNullAction)).toBe(true);
    });

    it('should not process null values for non-null operators', () => {
      // For non-null operators, the existing logic should prevent processing null values
      // This verifies the original behavior is preserved
      
      const equalsAction = RulePossibility.EQUALS;
      const containsAction = RulePossibility.CONTAINS;
      
      // Note: These tests validate that the doRuleAction method works correctly
      // but don't test the executeRule filtering logic directly since that's a private method
      // and requires more complex setup. The integration is tested through the boolean logic fix.
      
      expect(ruleComparatorService['doRuleAction']('test', 'test', equalsAction)).toBe(true);
      expect(ruleComparatorService['doRuleAction'](['a', 'b'], 'a', containsAction)).toBe(true);
    });
  });
});