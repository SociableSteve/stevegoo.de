# GitHub Workflows

This directory contains GitHub Actions workflows that enforce code quality and ensure the project maintains high standards.

## Workflows

### 🔄 CI Workflow (`ci.yml`)

**Triggers:** Push to main, Pull Requests to main

**What it does:**
- Tests on multiple Node.js versions (18.x, 20.x)
- Runs linting (`npm run lint`)
- Performs type checking (if configured)
- Executes unit tests (`npm test`)
- Runs E2E tests (`npm run test:e2e`)
- Builds the application (`npm run build`)
- Creates deployment preview for PRs
- Uploads build artifacts for review

### 🛡️ Branch Protection (`branch-protection.yml`)

**Triggers:** Push to main, Pull Requests to main

**Quality Gates:**
1. **🔍 Code Quality**: ESLint checks
2. **🔧 Type Safety**: TypeScript type checking
3. **🧪 Unit Tests**: All tests must pass
4. **🏗️ Build Verification**: Application must build successfully
5. **🌐 E2E Tests**: Critical user flows must work

**Enforcement:** PRs cannot be merged if any gate fails.

## Setting Up Branch Protection Rules

To enforce these workflows in your GitHub repository:

1. **Go to Repository Settings**
   - Navigate to Settings → Branches
   - Click "Add rule" for the main branch

2. **Configure Protection Rules**
   ```
   ✅ Require a pull request before merging
   ✅ Require status checks to pass before merging
   ✅ Require branches to be up to date before merging

   Required Status Checks:
   - quality-gates
   - enforce-quality
   - test (Node.js 18.x)
   - test (Node.js 20.x)

   ✅ Restrict pushes that create files that change this rule
   ✅ Do not allow bypassing the above settings
   ```

3. **Additional Recommendations**
   ```
   ✅ Require linear history
   ✅ Include administrators (even admins must follow rules)
   ✅ Allow force pushes (for maintainers only)
   ✅ Allow deletions (for maintainers only)
   ```

## Workflow Features

### 🚀 **Automatic Deployment Preview**
- Successful PRs get a preview deployment comment
- Easy to verify changes before merge

### 📊 **Multi-Node Testing**
- Tests on Node.js 18.x and 20.x
- Ensures compatibility across versions

### 📁 **Build Artifact Upload**
- Build outputs saved for 7 days
- Easy debugging of build issues

### 🔍 **Comprehensive Coverage**
- Linting for code style
- Type checking for safety
- Unit tests for logic
- E2E tests for user flows
- Build verification for deployment

## Local Development

Before pushing, run these commands locally to match CI:

```bash
# Quality checks (matches CI pipeline)
npm run lint          # Code quality
npm test              # Unit tests
npm run test:e2e      # E2E tests
npm run build         # Build verification

# Fix common issues
npm run lint -- --fix # Auto-fix linting issues
```

## Troubleshooting

### ❌ "Required status check missing"
- Ensure workflow names match branch protection settings
- Check that workflows are committed to the main branch

### ❌ "E2E tests fail in CI but work locally"
- Check Playwright browser installation
- Verify headless mode compatibility
- Review CI environment differences

### ❌ "Build fails in CI but works locally"
- Check Node.js version consistency
- Verify environment variables
- Review dependency lock files

## Benefits

✅ **Prevents Broken Code**: No broken changes can reach main
✅ **Maintains Quality**: Consistent code style and standards
✅ **Reduces Bugs**: Comprehensive testing catches issues early
✅ **Safe Deployments**: Build verification prevents deploy failures
✅ **Team Confidence**: Reliable, predictable development process

---

These workflows ensure that every change maintains the project's high quality standards and that the main branch is always in a deployable state.