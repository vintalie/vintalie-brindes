# API test skeletons

This folder contains skeletons for API tests (TypeScript). To run tests locally:

1. Install dev dependencies (jest/ts-jest) in `api/`:

```bash
cd api
yarn add -D jest ts-jest @types/jest
npx ts-jest config:init
```

2. Add a test script in `api/package.json`:

```json
"scripts": {
  "test": "jest"
}
```

3. Run `yarn test`.

Notes: tests are not included here yet; add tests for `webhookHandler` and repository logic.
