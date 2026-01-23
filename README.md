# Gliff

React components for Gliff, including Icons and Lottie animations.

## Installation

```bash
npm install gliff
```

Ensure you have the required peer dependencies installed:

```bash
npm install react react-dom
```

## Usage

### Icon

```tsx
import { Icon } from 'gliff';

function App() {
  return (
    <Icon 
      code="f015" 
      type="solid" 
      size="medium" 
      onClick={() => console.log('clicked')} 
    />
  );
}
```

### Lottie

```tsx
import { Lottie } from 'gliff';

function App() {
  return (
    <Lottie 
      src="/path/to/animation.json" 
      size="large" 
      autoPlay 
      loop 
    />
  );
}
```
