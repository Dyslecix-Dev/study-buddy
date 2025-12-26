# Gamification Tests Guide

This guide will teach you how to run and understand the gamification tests.

## 🧪 Your Testing Stack

You're using **Vitest** (not Jest!) for unit/integration tests. Vitest is like Jest but faster and works better with modern tools.

- **Vitest**: Unit and integration tests (files ending in `.test.ts`)
- **React Testing Library**: For testing React components
- **Cypress**: For end-to-end tests (not covered here)

## 📁 Test Files

### 1. `achievement-permanence.test.ts`
Tests that achievements are permanent and can't be lost if users delete items.

**What it tests:**
- Achievement durability (deletion-proof vs vulnerable)
- Reasonable achievement requirements
- Achievement categories coverage
- Edge cases (deleting items after earning achievements)

### 2. `api-integration.test.ts`
Tests that all API endpoints properly integrate with gamification.

**What it tests:**
- XP values are configured correctly
- All API routes award XP and track progress
- Error handling is in place
- UserProgress fields are tracked
- Special achievements (time-based, perfect scores, etc.)
- Implementation completeness checklist

## 🚀 How to Run Tests

### Run All Tests
```bash
npm test
```
This runs Vitest in **watch mode** - it will re-run tests when you change files.

### Run Tests Once (No Watch)
```bash
npm run test:run
```
Good for CI/CD or when you just want to check everything once.

### Run Specific Test File
```bash
npm test achievement-permanence
```
or
```bash
npm test api-integration
```

### Run Tests with UI (Visual Interface)
```bash
npm run test:ui
```
Opens a browser with a nice UI showing all your tests and their results. **This is great for beginners!**

### Run Tests with Coverage Report
```bash
npm run test:coverage
```
Shows what percentage of your code is covered by tests.

## 📖 Understanding Test Output

### ✅ Passing Test
```
✓ tests/gamification/api-integration.test.ts (15)
  ✓ Gamification API Integration (10)
    ✓ XP Values Configuration (5)
      ✓ should have XP values defined for all major actions
```
Green checkmarks = all good!

### ❌ Failing Test
```
✗ tests/gamification/achievement-permanence.test.ts
  ✗ All Achievements Are Achievable
    ✗ should have a clear path to unlock every achievement
      Expected: 58
      Received: 60
```
Red X = something's wrong. The test expected 58 achievements but found 60.

### Console Output
Tests can print helpful information:
```
📊 Achievement Permanence Report:
  ✅ Deletion-Proof: 45
  ⚠️  Potentially Vulnerable: 13
```

## 🔍 How Tests Work

### Basic Test Structure
```typescript
describe('Feature Name', () => {
  it('should do something specific', () => {
    // Arrange: Set up test data
    const value = 5;

    // Act: Perform the action
    const result = value + 5;

    // Assert: Check if it worked
    expect(result).toBe(10);
  });
});
```

### Common Assertions (expect statements)
```typescript
// Equality
expect(value).toBe(5);              // Strict equality
expect(value).toEqual({ a: 1 });    // Deep equality for objects

// Comparison
expect(value).toBeGreaterThan(10);
expect(value).toBeLessThan(100);
expect(value).toBeGreaterThanOrEqual(10);

// Boolean
expect(value).toBeTruthy();         // Is truthy (not false, 0, '', null, undefined)
expect(value).toBeFalsy();          // Is falsy
expect(value).toBeDefined();        // Is not undefined
expect(value).toBeNull();           // Is null

// Arrays
expect(array).toHaveLength(5);
expect(array).toContain(item);

// Strings
expect(string).toMatch(/pattern/);  // Regex match
expect(string).toContain('substring');
```

## 📊 Reading Test Results

### Gamification API Integration Test Results

When you run `npm test api-integration`, you'll see output like:

```
📋 Implementation Checklist:
  ✅ Step 2: Update Note Update Endpoint
      Status: XP integration added
  ✅ Step 3: Update Tasks API
      Status: XP and tracking added
  ...

Test Files  1 passed (1)
     Tests  12 passed (12)
```

**What this means:**
- All 12 test cases passed
- All API endpoints have gamification integrated
- XP values are reasonable
- Error handling is in place

### Achievement Permanence Test Results

```
📊 Achievement Permanence Report:
  ✅ Deletion-Proof: 45
  ⚠️  Potentially Vulnerable: 13

✓ notes: 8 achievements
✓ tasks: 7 achievements
✓ flashcards: 9 achievements
...
```

**What this means:**
- 45 achievements are safe from deletions (based on historical actions)
- 13 achievements might be affected if users delete items
- Shows how many achievements exist in each category

## 🐛 Common Issues

### Issue: Tests fail with "Cannot find module"
**Solution:** Make sure you've run `npm install` to install dependencies.

### Issue: Tests fail with "ACHIEVEMENTS is not defined"
**Solution:** Check that `/lib/gamification.ts` exports `ACHIEVEMENTS` properly.

### Issue: Tests fail with "XP_VALUES is not defined"
**Solution:** Check that `/lib/gamification.ts` exports `XP_VALUES` properly.

### Issue: Expected 58 achievements but got different number
**Solution:** This is expected if you've added or removed achievements. Update the test:
```typescript
expect(ACHIEVEMENTS.length).toBe(58); // Change 58 to your actual count
```

## 📝 Test Coverage Goals

### Current Coverage
Run `npm run test:coverage` to see:
```
File                        | % Stmts | % Branch | % Funcs | % Lines |
----------------------------|---------|----------|---------|---------|
lib/gamification.ts         |   85.2  |   78.3   |   92.1  |   84.9  |
lib/achievement-helpers.ts  |   72.4  |   65.8   |   88.3  |   71.2  |
```

**What these mean:**
- **% Stmts**: Percentage of statements (lines of code) executed
- **% Branch**: Percentage of if/else branches tested
- **% Funcs**: Percentage of functions tested
- **% Lines**: Percentage of lines executed

**Good Coverage Goals:**
- 80%+ is good
- 90%+ is great
- 100% is often unnecessary (diminishing returns)

## ✅ Verifying Your Implementation

### Step 1: Run the API Integration Test
```bash
npm test api-integration
```

**Look for:**
- ✅ All 12+ tests passing
- Console output showing all API endpoints implemented
- Implementation checklist showing 10/10 steps complete

### Step 2: Run the Achievement Permanence Test
```bash
npm test achievement-permanence
```

**Look for:**
- ✅ All tests passing
- Achievement count matches expected (58 or your custom count)
- Deletion-proof achievements > vulnerable achievements

### Step 3: Check for Warnings
Look at the console output for warnings like:
```
⚠️  Achievement "Deck Collector" may be affected by deletions
```

These are informational - they tell you which achievements might need special attention.

## 🎯 Next Steps

After tests pass:

1. **Run the app** and manually test:
   - Create a note → Check if XP was awarded
   - Complete a task → Check if achievements unlock
   - Review flashcards → Check if streak tracks

2. **Monitor logs** for gamification errors:
   ```
   Gamification error: [error details]
   ```
   These are caught and won't break your app, but you should fix them.

3. **Check the database**:
   - Open Prisma Studio: `npx prisma studio`
   - Look at UserProgress table
   - Verify counters are incrementing

## 📚 Learning Resources

- [Vitest Docs](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/)
- [Jest/Vitest Cheat Sheet](https://vitest.dev/guide/)

## 💡 Tips

1. **Start with one test**: Don't try to understand everything at once
2. **Read the test names**: They describe what should happen
3. **Look at the assertions**: The `expect()` lines tell you what's being checked
4. **Use console.log**: Add console.log in tests to see values
5. **Run tests in UI mode**: `npm run test:ui` for visual debugging

## 🆘 Getting Help

If tests fail:
1. Read the error message carefully
2. Find which test failed
3. Look at what was expected vs received
4. Check the relevant code file
5. Add console.log to debug

Example error:
```
Expected: 10
Received: 8
```
Means: Test expected value to be 10, but got 8 instead.

---

Good luck! Remember: **Green tests = working gamification system** ✅
