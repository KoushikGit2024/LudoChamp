# Zustand Infinite Loop Prevention Guide

## Critical Issues Found

### 1. **Session.jsx - Function in useEffect Dependency**
**Location:** `frontend/src/pages/Session.jsx:14`
**Issue:** `initiate` function in dependency array can cause unnecessary re-renders
**Fix:** Remove function from dependencies or use `useCallback` pattern

### 2. **GameBoard.jsx - Accessing Function as Value**
**Location:** `frontend/src/components/offlineBoard/gameboard/GameBoard.jsx:103`
**Issue:** `pieceState` is a function in store but accessed as a value
**Fix:** Access `pieceState` correctly or change store structure

### 3. **LudoOffline.jsx - Multiple Separate Selectors**
**Location:** `frontend/src/components/offlineBoard/LudoOffline.jsx:36-45`
**Issue:** Multiple `useGameStore` calls create separate subscriptions, causing unnecessary re-renders
**Fix:** Combine selectors using `shallow` comparison

### 4. **LudoOffline.jsx - Set Creation on Every Render**
**Location:** `frontend/src/components/offlineBoard/LudoOffline.jsx:18-19`
**Issue:** Creating new Set on every render causes reference changes
**Fix:** Use `useMemo` or access Set directly from store

### 5. **useGameStore.js - Set Access Bug**
**Location:** `frontend/src/store/useGameStore.js:223`
**Issue:** `onBoard` is a Set but accessed as array with `[playerIdx]`
**Fix:** Convert Set to Array or use proper Set methods

### 6. **useGameStore.js - Array Reference Issue**
**Location:** `frontend/src/store/useGameStore.js:160`
**Issue:** `pieceState:[...map]` creates new array reference every time
**Fix:** Only update if actually changed

---

## Best Practices to Follow

### ✅ DO:
1. **Use `shallow` for object/array selectors**
   ```jsx
   const { prop1, prop2 } = useGameStore(
     state => ({ prop1: state.prop1, prop2: state.prop2 }),
     shallow
   );
   ```

2. **Combine multiple selectors into one**
   ```jsx
   // ❌ BAD - Multiple subscriptions
   const turn = useGameStore(state => state.move.turn);
   const color = useGameStore(state => state.players[turn].color);
   
   // ✅ GOOD - Single subscription
   const { turn, color } = useGameStore(
     state => ({ 
       turn: state.move.turn, 
       color: state.players[state.move.turn].color 
     }),
     shallow
   );
   ```

3. **Use `useMemo` for derived values**
   ```jsx
   const playersSet = useMemo(
     () => new Set(useGameStore.getState().meta.onBoard),
     [useGameStore(state => state.meta.onBoard)]
   );
   ```

4. **Extract actions outside render**
   ```jsx
   // ✅ GOOD - Action is stable
   const updateMoveCount = useGameStore(state => state.updateMoveCount);
   ```

5. **Use equality function for complex selectors**
   ```jsx
   import { shallow } from 'zustand/shallow';
   
   const data = useGameStore(
     state => state.complexObject,
     shallow
   );
   ```

### ❌ DON'T:
1. **Don't call actions in render**
   ```jsx
   // ❌ BAD
   return <div>{useGameStore.getState().initiateGame(obj)}</div>;
   ```

2. **Don't create new objects/arrays in selectors without shallow**
   ```jsx
   // ❌ BAD - New object every time
   const data = useGameStore(state => ({ a: state.a, b: state.b }));
   
   // ✅ GOOD - Use shallow
   const data = useGameStore(
     state => ({ a: state.a, b: state.b }),
     shallow
   );
   ```

3. **Don't access store values that are functions as if they were values**
   ```jsx
   // ❌ BAD - pieceState is a function
   const pieceState = useGameStore(state => state.pieceState);
   
   // ✅ GOOD - Call the function or fix store
   const pieceState = useGameStore(state => state.pieceState());
   ```

4. **Don't put action functions in useEffect dependencies**
   ```jsx
   // ❌ BAD - Can cause issues
   useEffect(() => {
     initiate(gameObj);
   }, [initiate]);
   
   // ✅ GOOD - Actions are stable, omit from deps
   useEffect(() => {
     initiate(gameObj);
   }, []); // or use useCallback pattern
   ```

5. **Don't create new Set/Map/Array instances on every render**
   ```jsx
   // ❌ BAD - New Set every render
   const players = new Set(useGameStore(state => state.meta.onBoard));
   
   // ✅ GOOD - Memoize or use directly
   const playersSet = useGameStore(state => state.meta.onBoard);
   ```

---

## Specific Fixes Needed

### Fix 1: Session.jsx
```jsx
// Current (line 7-14)
useEffect(() => {
  const gameObj = {...};
  initiate(gameObj);
}, [initiate])

// Fixed
useEffect(() => {
  const gameObj = {...};
  initiate(gameObj);
}, []) // initiate is stable, no need in deps
```

### Fix 2: GameBoard.jsx - pieceState
```jsx
// Current (line 103)
const pieceState = useGameStore(state => state.pieceState);

// Fixed - Option 1: If pieceState should be a value
// Change store: pieceState: Array.from({ length: 92 }, () => ({ R:0, B:0, Y:0, G:0 }))

// Fixed - Option 2: If pieceState should be a function
const pieceState = useGameStore(state => state.pieceState());
```

### Fix 3: LudoOffline.jsx - Combine selectors
```jsx
// Current (lines 36-45)
const turn = useGameStore(state => state.move.turn);
const curColor = useGameStore(state => state.players[turn].color);
const moveObj = useGameStore(state => state.move);
// ... etc

// Fixed
const {
  turn,
  curColor,
  moveObj,
  homeCount,
  winPosn,
  pieces,
  rollAllowed
} = useGameStore(
  state => ({
    turn: state.move.turn,
    curColor: state.players[state.move.turn].color,
    moveObj: state.move,
    homeCount: state.players[state.move.turn].homeCount,
    winPosn: state.players[state.move.turn].winPosn,
    pieces: state.players[state.move.turn].pieces,
    rollAllowed: state.move.rollAllowed,
  }),
  shallow
);
```

### Fix 4: LudoOffline.jsx - Set creation
```jsx
// Current (lines 18-19)
const playersSet = useGameStore((state) => (state.meta?.onBoard));
const players = new Set(playersSet);

// Fixed
const playersSet = useGameStore((state) => state.meta?.onBoard);
// Use playersSet directly (it's already a Set)
```

### Fix 5: useGameStore.js - transferTurn Set access
```jsx
// Current (line 223)
const turn = Obj.meta.onBoard[playerIdx]; // ❌ onBoard is Set, not Array

// Fixed
const onBoardArray = Array.from(Obj.meta.onBoard);
const turn = onBoardArray[playerIdx];
```

### Fix 6: useGameStore.js - pieceState initialization
```jsx
// Current (line 9-11)
pieceState:()=>{
  return Array.from({ length: 92 }, () => ({ R:0, B:0, Y:0, G:0 }));
},

// Fixed - Make it a value, not a function
pieceState: Array.from({ length: 92 }, () => ({ R:0, B:0, Y:0, G:0 })),
```

---

## Additional Recommendations

1. **Use Zustand's `subscribeWithSelector` middleware** for complex subscriptions
2. **Consider splitting stores** if one store becomes too large
3. **Use `useShallow` hook** (Zustand v4.4+) instead of importing `shallow`
4. **Memoize expensive computations** that depend on store values
5. **Avoid nested object access in selectors** - flatten if possible
6. **Use `getState()` for one-time reads** outside of components

---

## Testing for Infinite Loops

1. **Check React DevTools Profiler** - Look for excessive re-renders
2. **Add console.logs** in components to track render frequency
3. **Use Zustand DevTools** to monitor state changes
4. **Watch for circular dependencies** in state updates
5. **Test with React StrictMode** - It double-renders to catch issues

---

## Summary

The main causes of infinite loops with Zustand are:
1. Creating new object/array references in selectors
2. Multiple separate subscriptions instead of combined ones
3. Accessing functions as values
4. Incorrect Set/Array access patterns
5. Unnecessary dependencies in useEffect

Fix these issues systematically, starting with the critical ones listed above.
