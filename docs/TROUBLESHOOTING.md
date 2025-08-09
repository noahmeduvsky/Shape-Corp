# Troubleshooting Guide

This guide helps you resolve common issues when working with the PLEX ERP Automation System.

## 📋 Table of Contents

- [Common Issues](#common-issues)
- [Development Issues](#development-issues)
- [Testing Issues](#testing-issues)
- [Deployment Issues](#deployment-issues)
- [Performance Issues](#performance-issues)
- [API Issues](#api-issues)
- [Getting Help](#getting-help)

## 🚨 Common Issues

### 1. "Part not found" Error

**Problem**: Part number not recognized when creating kanbans

**Symptoms**:
```
Error: Part not found
```

**Solution**:
1. **Use valid part numbers**: Use only the mock part numbers available in the system:
   - `PART-001`
   - `PART-002` 
   - `PART-003`

2. **Check dropdown options**: Use the dropdown menus in the UI instead of typing part numbers manually

3. **Verify mock data**: Ensure the system is using mock data by checking the configuration

**Prevention**:
- Always use the dropdown menus for part selection
- Refer to the mock data documentation for valid values

### 2. 404 Not Found API Errors

**Problem**: API calls returning 404 errors during development

**Symptoms**:
```
POST http://localhost:3000/jobs 404 (Not Found)
PLEX API request failed: Error: PLEX API Error: 404 Not Found
```

**Solution**:
1. **Check configuration**: Ensure mock data is being used:
   ```typescript
   // src/lib/config.ts
   export const config = {
     features: {
       useMockData: !process.env.PLEX_API_URL,
     }
   }
   ```

2. **Verify API client**: Ensure `getApiClient()` is being used instead of direct API calls

3. **Check environment variables**: Make sure PLEX credentials are not set for development

**Prevention**:
- Always use `getApiClient()` from the config module
- Don't set PLEX credentials during development

### 3. TypeScript Errors

**Problem**: Type checking failures during development

**Symptoms**:
```
Type 'any' is not assignable to type 'string'
Property 'status' does not exist on type 'DigitalKanban'
```

**Solution**:
1. **Run type checking**:
   ```bash
   npm run type-check
   ```

2. **Fix type issues**:
   - Add proper type annotations
   - Use interfaces instead of `any`
   - Import missing types

3. **Update type definitions**:
   ```typescript
   // Add missing properties to interfaces
   interface DigitalKanban {
     id: string;
     type: 'withdrawal' | 'production';
     status: 'pending' | 'in_progress' | 'completed';
     // ... other properties
   }
   ```

**Prevention**:
- Enable strict TypeScript mode
- Use proper type annotations
- Avoid `any` types

### 4. Test Failures

**Problem**: Tests not passing or failing unexpectedly

**Symptoms**:
```
FAIL src/__tests__/components/ProductionScheduler.test.tsx
TypeError: Cannot read properties of undefined (reading 'filter')
```

**Solution**:
1. **Check test data**: Ensure mock data is properly set up
2. **Update test selectors**: Use more robust element selectors
3. **Wrap state updates**: Use `act()` for React state updates
4. **Reset test state**: Clear state between tests

**Example fix**:
```typescript
// Wrap state updates in act()
await act(async () => {
  fireEvent.click(screen.getByRole('button', { name: /update/i }));
});
```

**Prevention**:
- Write isolated tests
- Use proper test data setup
- Follow testing best practices

## 🛠️ Development Issues

### Build Failures

**Problem**: Application fails to build

**Symptoms**:
```
Error: Cannot find module '@/lib/plex-api'
Module not found: Can't resolve '@/components/ProductionScheduler'
```

**Solution**:
1. **Clear cache and rebuild**:
   ```bash
   rm -rf .next node_modules
   npm install
   npm run build
   ```

2. **Check import paths**: Ensure correct path aliases are configured

3. **Verify TypeScript config**:
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["src/*"]
       }
     }
   }
   ```

### Development Server Issues

**Problem**: Development server not starting or running properly

**Symptoms**:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution**:
1. **Check port usage**:
   ```bash
   lsof -i :3000
   ```

2. **Kill conflicting process**:
   ```bash
   kill -9 <PID>
   ```

3. **Use different port**:
   ```bash
   npm run dev -- -p 3001
   ```

### Hot Reload Issues

**Problem**: Changes not reflecting in development

**Symptoms**:
- Changes not appearing after save
- Browser not refreshing

**Solution**:
1. **Restart development server**:
   ```bash
   npm run dev
   ```

2. **Clear browser cache**: Hard refresh (Ctrl+F5)

3. **Check file watching**: Ensure file system events are working

## 🧪 Testing Issues

### Jest Configuration Problems

**Problem**: Jest tests failing due to configuration issues

**Symptoms**:
```
Cannot find module '@/lib/plex-api' from 'src/__tests__/components/ProductionScheduler.test.tsx'
```

**Solution**:
1. **Update Jest config**:
   ```javascript
   // jest.config.js
   module.exports = {
     moduleDirectories: ['node_modules', '<rootDir>/'],
     moduleNameMapping: {
       '^@/(.*)$': '<rootDir>/src/$1',
     },
   }
   ```

2. **Check test environment**: Ensure proper setup files are loaded

### React Testing Library Issues

**Problem**: Component tests failing due to element selection

**Symptoms**:
```
Unable to find an element with the text: Production Scheduler
```

**Solution**:
1. **Use more robust selectors**:
   ```typescript
   // Instead of getByText
   screen.getByRole('heading', { name: /production scheduler/i })
   
   // For buttons
   screen.getByRole('button', { name: /update/i })
   ```

2. **Wait for async operations**:
   ```typescript
   await waitFor(() => {
     expect(screen.getByText('Production Scheduler')).toBeInTheDocument();
   });
   ```

### Cypress E2E Issues

**Problem**: End-to-end tests failing

**Symptoms**:
```
cy.get('[data-testid=kanban-form]').should('be.visible')
```

**Solution**:
1. **Add data attributes**: Use `data-testid` attributes for reliable selection
2. **Wait for elements**: Use proper waiting strategies
3. **Check selectors**: Ensure selectors are unique and stable

## 🚀 Deployment Issues

### Build Optimization Problems

**Problem**: Production build failing or too large

**Symptoms**:
```
Error: JavaScript heap out of memory
```

**Solution**:
1. **Increase memory limit**:
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm run build
   ```

2. **Analyze bundle size**:
   ```bash
   npm install --save-dev @next/bundle-analyzer
   ANALYZE=true npm run build
   ```

3. **Optimize imports**: Use dynamic imports for large components

### Docker Issues

**Problem**: Docker container not starting or running properly

**Symptoms**:
```
Error: Cannot find module 'next'
```

**Solution**:
1. **Check Dockerfile**: Ensure proper multi-stage build
2. **Verify dependencies**: Check package.json and node_modules
3. **Build context**: Ensure all files are included in build

### Environment Variable Issues

**Problem**: Environment variables not loading correctly

**Symptoms**:
```
process.env.PLEX_API_URL is undefined
```

**Solution**:
1. **Check file naming**: Use correct environment file names
2. **Verify variable names**: Ensure proper naming convention
3. **Restart server**: Restart after changing environment variables

## ⚡ Performance Issues

### Slow Development Server

**Problem**: Development server running slowly

**Symptoms**:
- Long startup times
- Slow hot reload
- High memory usage

**Solution**:
1. **Update dependencies**: Ensure latest versions
2. **Optimize imports**: Use dynamic imports
3. **Check file watching**: Monitor file system events

### Bundle Size Issues

**Problem**: Large bundle sizes affecting performance

**Symptoms**:
- Slow page loads
- Large JavaScript bundles

**Solution**:
1. **Analyze bundle**:
   ```bash
   npm run build
   # Check .next/analyze for bundle analysis
   ```

2. **Code splitting**: Use dynamic imports
3. **Tree shaking**: Remove unused code
4. **Optimize images**: Use Next.js Image component

## 🔌 API Issues

### Mock API Problems

**Problem**: Mock API not working correctly

**Symptoms**:
```
MockPlexApiClient is not defined
```

**Solution**:
1. **Check imports**: Ensure proper import statements
2. **Verify configuration**: Check config.ts setup
3. **Test mock data**: Verify mock data structure

### PLEX API Integration Issues

**Problem**: Real PLEX API not connecting

**Symptoms**:
```
PLEX API Error: 401 Unauthorized
```

**Solution**:
1. **Check credentials**: Verify API key and client ID
2. **Test connection**: Use curl or Postman to test API
3. **Check permissions**: Ensure proper API permissions

## 🆘 Getting Help

### Before Asking for Help

1. **Check this guide**: Look for similar issues
2. **Search issues**: Check existing GitHub issues
3. **Reproduce the problem**: Create a minimal reproduction
4. **Gather information**: Collect error messages and logs

### Information to Include

When reporting issues, include:

1. **Environment details**:
   - Operating system
   - Node.js version
   - npm version
   - Browser (if applicable)

2. **Error messages**: Complete error stack traces

3. **Steps to reproduce**: Clear, numbered steps

4. **Expected vs actual behavior**: What you expected vs what happened

5. **Screenshots**: Visual evidence of the issue

### Where to Get Help

- **GitHub Issues**: Create a new issue with detailed information
- **Documentation**: Check the docs folder for specific guides
- **Discussions**: Use GitHub Discussions for questions
- **Code Review**: Ask questions in pull request reviews

### Debugging Tools

1. **Browser DevTools**: For frontend issues
2. **Node.js Inspector**: For backend debugging
3. **React DevTools**: For React component debugging
4. **Network Tab**: For API request debugging

### Common Debugging Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Clear npm cache
npm cache clean --force

# Check for outdated packages
npm outdated

# Run with verbose logging
npm run dev -- --verbose

# Check TypeScript errors
npm run type-check

# Run tests with coverage
npm run test:coverage
```

---

**If you can't find a solution here, please create a detailed issue in the repository with all the information requested above.**
