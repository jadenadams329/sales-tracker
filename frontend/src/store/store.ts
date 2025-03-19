// src/store/store.ts
import { createStore, combineReducers, applyMiddleware, compose, StoreEnhancer, Store } from 'redux';
import  { thunk } from 'redux-thunk';

// Define types
interface PreloadedState {
  [key: string]: any;
}

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
    store?: Store;
  }
}

// Create root reducer
const rootReducer = combineReducers({
  // Add reducers here as needed
  // Empty for now as per instructions
});

// Configure enhancer based on environment
let enhancer: StoreEnhancer;

if (import.meta.env.MODE === 'production') {
  enhancer = applyMiddleware(thunk);
} else {
  // Dynamic import for redux-logger in development
  const configureEnhancer = async () => {
    const logger = (await import('redux-logger')).default;
    const composeEnhancers = 
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    return composeEnhancers(applyMiddleware(thunk, logger));
  };

  // Set enhancer synchronously first, then update with async logger
  enhancer = applyMiddleware(thunk);
  configureEnhancer().then((devEnhancer) => {
    enhancer = devEnhancer;
  });
}

// Configure store function
const configureStore = (preloadedState?: PreloadedState): Store => {
  return createStore(rootReducer, preloadedState, enhancer);
};

// Export types
export type RootState = ReturnType<typeof rootReducer>;

export default configureStore;