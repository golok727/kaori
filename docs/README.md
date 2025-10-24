# Kaori Documentation

This directory contains the VitePress documentation site for Kaori.

## Development

```bash
# Install dependencies (from root)
pnpm install

# Start dev server
pnpm docs:dev

# Build documentation
pnpm docs:build

# Preview built docs
pnpm docs:preview
```

## Structure

- `.vitepress/` - VitePress configuration and custom theme
- `guide/` - User guides and tutorials
- `api/` - API reference documentation
- `examples/` - Code examples and demos
- `public/` - Static assets (logo, images, etc.)

## Writing Documentation

### Markdown Features

VitePress supports extended markdown features:

- Code blocks with syntax highlighting
- Custom containers (tip, warning, danger)
- Code groups for multiple examples
- Automatic table of contents
- And much more!

### Adding a New Page

1. Create a new `.md` file in the appropriate directory
2. Add frontmatter if needed
3. Write content using markdown
4. Update `.vitepress/config.ts` to add it to the navigation/sidebar

### Custom Theme

The kawaii theme is defined in `.vitepress/theme/custom.css`. It features:

- Pink and purple gradient colors
- Cute emoji decorations
- Smooth animations
- Responsive design

## Deployment

The documentation can be deployed to GitHub Pages, Netlify, Vercel, or any static hosting provider.

### GitHub Pages

Add this workflow to `.github/workflows/docs.yml`:

```yaml
name: Deploy Docs

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 10.12.4
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: pnpm
      - run: pnpm install
      - run: pnpm docs:build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: docs/.vitepress/dist
```

## Contributing

When contributing to the documentation:

1. Keep language clear and concise
2. Include code examples where applicable
3. Test all code examples
4. Follow the existing style and structure
5. Run the build to ensure no errors

## License

MIT
