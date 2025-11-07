# Contributing to Quran MCP

Thank you for your interest in contributing to Quran MCP! We welcome contributions from the community and appreciate your help in making this project better.

## 📋 Code of Conduct

Please note that this project is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🎯 How to Contribute

### Reporting Bugs

Before submitting a bug report, please check the [issue tracker](https://github.com/Tanjim-Noor/Quran-mcp/issues) to see if the issue has already been reported.

When reporting a bug, please include:
- A clear, descriptive title
- A detailed description of the issue
- Steps to reproduce the behavior
- Expected behavior vs. actual behavior
- Screenshots or error messages (if applicable)
- Your environment details (Node.js version, OS, etc.)

### Suggesting Enhancements

We're always happy to hear suggestions for improvements! When proposing a feature:
- Use a clear, descriptive title
- Provide a detailed description of the proposed enhancement
- Explain why this enhancement would be useful
- List similar features in other projects (if applicable)

### Pull Requests

We welcome pull requests! Here's how to contribute code:

1. **Fork the repository** to your own GitHub account
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/Quran-mcp.git
   cd Quran-mcp
   ```

3. **Create a new branch** for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

4. **Set up your development environment:**
   ```bash
   pnpm install
   ```

5. **Make your changes** following our code style guidelines (see below)

6. **Test your changes:**
   ```bash
   pnpm type-check    # Type checking
   pnpm test:sdk      # Run SDK tests
   ```

7. **Commit your changes** with a clear, descriptive message:
   ```bash
   git commit -m "feat: add feature X" 
   # or
   git commit -m "fix: resolve issue with Y"
   ```

8. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

9. **Create a Pull Request** on the original repository with:
   - A clear title describing the changes
   - A description of what was changed and why
   - Reference to any related issues (e.g., "Fixes #123")
   - Screenshots or examples (if applicable)

## 🎨 Code Style Guidelines

- **TypeScript**: We use TypeScript for type safety
- **Formatting**: Code is formatted with Prettier (`pnpm` format or auto-formatted on commit)
- **Naming**: 
  - Use camelCase for variables and functions
  - Use PascalCase for classes and types
  - Use UPPER_SNAKE_CASE for constants
- **Comments**: Include JSDoc comments for public functions and complex logic
- **No console logs**: Use proper error handling instead

### Example:
```typescript
/**
 * Fetches a verse from the Quran API
 * @param verseKey - The verse identifier (e.g., "2:255")
 * @returns The verse data with translations
 */
export async function getVerse(verseKey: string) {
  // implementation
}
```

## 📁 Project Structure

- `src/` - Source code
  - `quran/` - Quran API integration
  - `index.ts` - Main MCP server entry point
  - `github-handler.ts` - GitHub OAuth handler
  - `utils.ts` - Utility functions
- `knowledge-base/` - Documentation and guides
- `.github/` - GitHub templates and workflows

## 🚀 Development Workflow

### Local Development
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Type checking
pnpm type-check

# Run tests
pnpm test:sdk
```

### Environment Setup
Copy `.dev.vars.example` to `.dev.vars` and fill in the required credentials:
```bash
cp .dev.vars.example .dev.vars
```

See [knowledge-base/ENVIRONMENT-SETUP.md](knowledge-base/ENVIRONMENT-SETUP.md) for detailed setup instructions.

## 📚 Documentation

When contributing features, please:
- Update relevant documentation in the README.md
- Add or update comments in your code
- Update `.dev.vars.example` if new environment variables are needed
- Consider adding examples to the knowledge-base if needed

## 🔄 Review Process

1. All PRs will be reviewed by maintainers
2. Changes may be requested before approval
3. Once approved, your PR will be merged into the main branch
4. Your contribution will be credited in the project

## ✨ Recognition

Contributors will be recognized in:
- The project's README
- Release notes for versions with their contributions
- Our community contributors list

## 💬 Questions?

Feel free to:
- Open an issue with the `question` label
- Check the [knowledge-base/](knowledge-base/) for existing documentation
- Contact maintainers via GitHub discussions

## 📝 Commit Message Convention

We follow conventional commits:
- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring without feature changes
- `test:` - Adding or updating tests
- `chore:` - Build, dependencies, or tooling changes

Example:
```
feat: add word-by-word analysis to getVerse tool

- Implement word-by-word parsing
- Add words field to response schema
- Update documentation with examples

Closes #42
```

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under its MIT License.

Thank you for contributing! 🙏
