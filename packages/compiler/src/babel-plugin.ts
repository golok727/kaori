// Refactored by Dominic Gannaway - Birthday Edition! 🎂
import type { PluginObj, PluginPass } from '@babel/core';
import * as t from '@babel/types';

/*
Todo
- Spread attributes
- Should not allow both classMap and class in an element
- prop destructuring ??
*/

const KAORI_PACKAGE_NAME = 'kaori.js';

// ============================================================================
// Import Manager - Handles all import-related logic
// ============================================================================

type ImportType =
  | 'component'
  | 'html'
  | 'ref'
  | 'styleMap'
  | 'classMap'
  | 'spread'
  | 'mergeProps';

interface ImportInfo {
  name: string; // The name to use in generated code
  exists: boolean; // Whether it's already imported
  needed: boolean; // Whether the plugin needs it
}

class ImportManager {
  private imports = new Map<ImportType, ImportInfo>();
  private existingNames = new Set<string>();

  constructor() {
    this.imports.set('component', {
      name: 'component',
      exists: false,
      needed: false,
    });
    this.imports.set('html', { name: 'html', exists: false, needed: false });
    this.imports.set('ref', { name: 'ref', exists: false, needed: false });
    this.imports.set('styleMap', {
      name: 'styleMap',
      exists: false,
      needed: false,
    });
    this.imports.set('classMap', {
      name: 'classMap',
      exists: false,
      needed: false,
    });
    this.imports.set('spread', {
      name: 'spread',
      exists: false,
      needed: false,
    });
    this.imports.set('mergeProps', {
      name: 'mergeProps',
      exists: false,
      needed: false,
    });
  }

  /**
   * Scan the program for existing identifiers and kaori imports
   */
  scanProgram(path: any): void {
    // Collect all existing identifiers
    path.traverse({
      Identifier: (innerPath: any) => {
        this.existingNames.add(innerPath.node.name);
      },
    });

    // Check for existing kaori imports
    path.traverse({
      ImportDeclaration: (innerPath: any) => {
        if (
          t.isStringLiteral(innerPath.node.source) &&
          (innerPath.node.source.value === KAORI_PACKAGE_NAME ||
            innerPath.node.source.value.includes('kaori'))
        ) {
          innerPath.node.specifiers.forEach((spec: any) => {
            if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported)) {
              const importedName = spec.imported.name as ImportType;
              const localName = spec.local.name;

              if (this.imports.has(importedName)) {
                const info = this.imports.get(importedName)!;
                info.name = localName;
                info.exists = true;
              }
            }
          });
        }
      },
    });

    // For imports that don't exist, find non-conflicting names
    for (const [type, info] of this.imports.entries()) {
      if (!info.exists) {
        info.name = this.findNonConflictingName(type);
      }
    }
  }

  /**
   * Find a non-conflicting name for an import
   */
  private findNonConflictingName(baseName: string): string {
    if (!this.existingNames.has(baseName)) {
      return baseName;
    }

    let counter = 1;
    let candidate = `${baseName}${counter}`;
    while (this.existingNames.has(candidate)) {
      counter++;
      candidate = `${baseName}${counter}`;
    }
    return candidate;
  }

  /**
   * Mark an import as needed
   */
  markNeeded(type: ImportType): void {
    const info = this.imports.get(type);
    if (info) {
      info.needed = true;
    }
  }

  /**
   * Get the local name for an import type
   */
  getName(type: ImportType): string {
    return this.imports.get(type)!.name;
  }

  /**
   * Generate import declarations for needed imports that don't exist
   */
  generateImports(): t.ImportDeclaration | null {
    const neededImports: t.ImportSpecifier[] = [];

    for (const [type, info] of this.imports.entries()) {
      if (info.needed && !info.exists) {
        neededImports.push(
          t.importSpecifier(t.identifier(info.name), t.identifier(type))
        );
      }
    }

    if (neededImports.length === 0) {
      return null;
    }

    return t.importDeclaration(
      neededImports,
      t.stringLiteral(KAORI_PACKAGE_NAME)
    );
  }
}

// ============================================================================
// Template Builder - Fluent API for building template literals
// ============================================================================

class TemplateBuilder {
  private parts: string[] = [''];
  private expressions: t.Expression[] = [];

  /**
   * Add static text to the current template part
   */
  addStatic(text: string): this {
    this.parts[this.parts.length - 1] += text;
    return this;
  }

  /**
   * Add a dynamic expression to the template
   */
  addExpression(expr: t.Expression): this {
    this.parts.push('');
    this.expressions.push(expr);
    return this;
  }

  /**
   * Build the template literal
   */
  build(): t.TemplateLiteral {
    const templateElements = this.parts.map((part, index) =>
      t.templateElement(
        { raw: part, cooked: part },
        index === this.parts.length - 1
      )
    );

    return t.templateLiteral(templateElements, this.expressions);
  }

  /**
   * Check if template is empty
   */
  isEmpty(): boolean {
    return (
      this.parts.length === 1 &&
      this.parts[0] === '' &&
      this.expressions.length === 0
    );
  }
}

// ============================================================================
// Attribute Processor - Handles JSX attribute transformations
// ============================================================================

interface ProcessedAttribute {
  type: 'static' | 'dynamic' | 'directive';
  content?: string; // For static attributes
  name?: string; // For dynamic attributes
  expression?: t.Expression; // For dynamic attributes and directives
}

class AttributeProcessor {
  constructor(private importManager: ImportManager) {}

  /**
   * Process JSX attributes and return template-ready results
   */
  processAttributes(
    attributes: (t.JSXAttribute | t.JSXSpreadAttribute)[]
  ): ProcessedAttribute[] {
    const results: ProcessedAttribute[] = [];

    for (const attr of attributes) {
      if (t.isJSXSpreadAttribute(attr)) {
        // Handle spread attributes for HTML elements
        this.importManager.markNeeded('spread');
        results.push({
          type: 'directive',
          expression: t.callExpression(
            t.identifier(this.importManager.getName('spread')),
            [attr.argument]
          ),
        });
      } else if (t.isJSXAttribute(attr)) {
        const processed = this.processAttribute(attr);
        if (processed) {
          results.push(processed);
        }
      }
    }

    return results;
  }

  private processAttribute(attr: t.JSXAttribute): ProcessedAttribute | null {
    const attrName = this.getAttributeName(attr);
    const attrValue = this.getAttributeValue(attr);

    if (!attrName || !attrValue) {
      return null;
    }

    // Handle ref directive
    if (attrName === 'ref') {
      this.importManager.markNeeded('ref');
      return {
        type: 'directive',
        expression: t.callExpression(
          t.identifier(this.importManager.getName('ref')),
          [attrValue]
        ),
      };
    }

    // Handle style attribute with object expressions
    if (attrName === 'style' && !t.isStringLiteral(attrValue)) {
      // Check if it's an object expression or identifier (object variable)
      // Also handle member expressions, call expressions, conditional expressions, and logical expressions
      if (
        t.isObjectExpression(attrValue) ||
        t.isIdentifier(attrValue) ||
        t.isMemberExpression(attrValue) ||
        t.isCallExpression(attrValue) ||
        t.isConditionalExpression(attrValue) ||
        t.isLogicalExpression(attrValue)
      ) {
        this.importManager.markNeeded('styleMap');
        return {
          type: 'dynamic',
          name: 'style',
          expression: t.callExpression(
            t.identifier(this.importManager.getName('styleMap')),
            [attrValue]
          ),
        };
      }
    }

    // Handle classMap attribute with object expressions
    if (attrName === 'classMap' && !t.isStringLiteral(attrValue)) {
      // Check if it's an object expression or identifier (object variable)
      // Also handle member expressions, call expressions, conditional expressions, and logical expressions
      if (
        t.isObjectExpression(attrValue) ||
        t.isIdentifier(attrValue) ||
        t.isMemberExpression(attrValue) ||
        t.isCallExpression(attrValue) ||
        t.isConditionalExpression(attrValue) ||
        t.isLogicalExpression(attrValue)
      ) {
        this.importManager.markNeeded('classMap');
        return {
          type: 'dynamic',
          name: 'class',
          expression: t.callExpression(
            t.identifier(this.importManager.getName('classMap')),
            [attrValue]
          ),
        };
      }
    }

    const normalizedName = this.normalizeAttributeName(attrName);

    // Handle event handlers (onClick -> @click)
    if (attrName.startsWith('on') && attrName.length > 2) {
      const eventName = attrName.slice(2).toLowerCase();
      return {
        type: 'dynamic',
        name: `@${eventName}`,
        expression: attrValue,
      };
    }

    // Handle namespaced attributes (prop:value, bool:disabled)
    if (attrName.includes(':')) {
      const [namespace, name] = attrName.split(':');
      if (namespace === 'prop') {
        return {
          type: 'dynamic',
          name: `.${name}`,
          expression: attrValue,
        };
      } else if (namespace === 'bool') {
        return {
          type: 'dynamic',
          name: `?${name}`,
          expression: attrValue,
        };
      }
      // Other namespaced attributes fall through to regular handling
    }

    // Static string attribute
    if (t.isStringLiteral(attrValue)) {
      return {
        type: 'static',
        content: ` ${normalizedName}="${attrValue.value}"`,
      };
    }

    // Dynamic attribute
    return {
      type: 'dynamic',
      name: normalizedName,
      expression: attrValue,
    };
  }

  private getAttributeName(attr: t.JSXAttribute): string | null {
    if (t.isJSXIdentifier(attr.name)) {
      return attr.name.name;
    }
    if (t.isJSXNamespacedName(attr.name)) {
      return `${attr.name.namespace.name}:${attr.name.name.name}`;
    }
    return null;
  }

  private getAttributeValue(attr: t.JSXAttribute): t.Expression | null {
    if (!attr.value) {
      return t.booleanLiteral(true);
    }

    if (t.isStringLiteral(attr.value)) {
      return attr.value;
    }

    if (t.isJSXExpressionContainer(attr.value)) {
      return attr.value.expression as t.Expression;
    }

    return null;
  }

  private normalizeAttributeName(attrName: string): string {
    if (attrName === 'className') return 'class';
    return attrName;
  }
}

// ============================================================================
// Plugin State
// ============================================================================

interface CompilerWarning {
  message: string;
  line?: number;
  column?: number;
}

interface PluginState extends PluginPass {
  importManager?: ImportManager;
  attributeProcessor?: AttributeProcessor;
  warnings?: CompilerWarning[];
}

function addWarning(state: PluginState, message: string, node?: t.Node): void {
  if (!state.warnings) {
    state.warnings = [];
  }
  state.warnings.push({
    message,
    line: node?.loc?.start.line,
    column: node?.loc?.start.column,
  });
  console.warn(`[Kaori Compiler Warning]: ${message}`);
}

// ============================================================================
// Main Plugin
// ============================================================================

export function KaoriCompiler(): PluginObj<PluginState> {
  return {
    name: 'jsx-to-lit-html',
    visitor: {
      Program: {
        enter(path, state) {
          // Initialize managers
          state.importManager = new ImportManager();
          state.importManager.scanProgram(path);
          state.attributeProcessor = new AttributeProcessor(
            state.importManager
          );
          state.warnings = [];
        },
        exit(path, state) {
          // Add any needed imports
          const importDecl = state.importManager!.generateImports();
          if (importDecl) {
            path.unshiftContainer('body', importDecl);
          }
          // Export warnings for external tools (ESLint, etc.)
          if (state.warnings && state.warnings.length > 0) {
            (state.file as any).metadata = (state.file as any).metadata || {};
            (state.file as any).metadata.kaoriWarnings = state.warnings;
          }
        },
      },

      JSXElement(path, state) {
        const { node } = path;
        const tagName = getJSXElementName(node.openingElement.name);

        // Check if this is a component (starts with capital letter)
        if (isComponent(tagName)) {
          state.importManager!.markNeeded('component');
          state.importManager!.markNeeded('html');
          const componentCall = createComponentCall(node, tagName, state);
          // Wrap component call in html template literal
          const wrappedComponent = t.taggedTemplateExpression(
            t.identifier(state.importManager!.getName('html')),
            t.templateLiteral(
              [
                t.templateElement({ raw: '', cooked: '' }, false),
                t.templateElement({ raw: '', cooked: '' }, true),
              ],
              [componentCall]
            )
          );
          path.replaceWith(wrappedComponent);
        } else {
          state.importManager!.markNeeded('html');
          path.replaceWith(createHTMLElement(node, state));
        }
      },

      JSXFragment(path, state) {
        state.importManager!.markNeeded('html');
        const children = processChildren(path.node.children, state);

        if (children.length === 0) {
          // Empty fragment
          const builder = new TemplateBuilder();
          path.replaceWith(
            t.taggedTemplateExpression(
              t.identifier(state.importManager!.getName('html')),
              builder.build()
            )
          );
        } else if (children.length === 1) {
          // Single child - wrap in html``
          const builder = new TemplateBuilder();
          builder.addExpression(children[0]);
          path.replaceWith(
            t.taggedTemplateExpression(
              t.identifier(state.importManager!.getName('html')),
              builder.build()
            )
          );
        } else {
          // Multiple children - create array expression
          path.replaceWith(t.arrayExpression(children));
        }
      },
    },
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function getJSXElementName(
  name: t.JSXIdentifier | t.JSXMemberExpression | t.JSXNamespacedName
): string {
  if (t.isJSXIdentifier(name)) {
    return name.name;
  }
  if (t.isJSXMemberExpression(name)) {
    return `${getJSXElementName(name.object)}.${name.property.name}`;
  }
  if (t.isJSXNamespacedName(name)) {
    return `${name.namespace.name}:${name.name.name}`;
  }
  return '';
}

function isComponent(tagName: string): boolean {
  return /^[A-Z]/.test(tagName);
}

function isSelfClosingTag(tagName: string): boolean {
  const selfClosingTags = [
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
  ];
  return selfClosingTags.includes(tagName.toLowerCase());
}

// ============================================================================
// Component Handling
// ============================================================================

function createComponentCall(
  element: t.JSXElement,
  componentName: string,
  state: PluginState
): t.Expression {
  const attributes = element.openingElement.attributes;
  const children = processChildren(element.children, state);

  // Check if we have spreads
  const hasSpread = attributes.some(attr => t.isJSXSpreadAttribute(attr));

  let propsArg: t.Expression;

  if (hasSpread) {
    // Check for optimization: single spread with no other props and no children
    const onlySpread =
      attributes.length === 1 &&
      t.isJSXSpreadAttribute(attributes[0]) &&
      children.length === 0;

    if (onlySpread) {
      // Optimization: <Component {...props}/> becomes component(Component, props)
      propsArg = (attributes[0] as t.JSXSpreadAttribute).argument;
    } else {
      // Use mergeProps for multiple spreads or spreads with other props
      state.importManager!.markNeeded('mergeProps');

      const mergePropsArgs: t.Expression[] = [];
      let currentObjectProps: (t.ObjectProperty | t.ObjectMethod)[] = [];

      // Process attributes in order
      for (const attr of attributes) {
        if (t.isJSXSpreadAttribute(attr)) {
          // Flush accumulated object props before adding spread
          if (currentObjectProps.length > 0) {
            mergePropsArgs.push(t.objectExpression(currentObjectProps));
            currentObjectProps = [];
          }
          mergePropsArgs.push(attr.argument);
        } else if (t.isJSXAttribute(attr)) {
          const propName = getAttributeName(attr);
          const propValue = getAttributeValue(attr);

          if (propName && propValue) {
            const isValidId = isValidIdentifier(propName);

            if (needsGetterWrapping(propValue)) {
              const key = isValidId
                ? t.identifier(propName)
                : t.stringLiteral(propName);
              const getter = t.objectMethod(
                'get',
                key,
                [],
                t.blockStatement([t.returnStatement(propValue)]),
                !isValidId
              );
              currentObjectProps.push(getter);
            } else {
              const key = isValidId
                ? t.identifier(propName)
                : t.stringLiteral(propName);
              currentObjectProps.push(t.objectProperty(key, propValue));
            }
          }
        }
      }

      // Flush any remaining object props
      if (currentObjectProps.length > 0) {
        mergePropsArgs.push(t.objectExpression(currentObjectProps));
      }

      // Add children if they exist
      if (children.length > 0) {
        const childrenValue =
          children.length === 1 ? children[0] : t.arrayExpression(children);

        const childrenObj = needsGetterWrapping(childrenValue)
          ? t.objectExpression([
              t.objectMethod(
                'get',
                t.identifier('children'),
                [],
                t.blockStatement([t.returnStatement(childrenValue)])
              ),
            ])
          : t.objectExpression([
              t.objectProperty(t.identifier('children'), childrenValue),
            ]);

        mergePropsArgs.push(childrenObj);
      }

      propsArg = t.callExpression(
        t.identifier(state.importManager!.getName('mergeProps')),
        mergePropsArgs
      );
    }
  } else {
    // No spreads, use original logic
    const props = createPropsObject(attributes, state, element);

    // Check if both children prop and children content exist (Issue #2)
    if (children.length > 0 && t.isObjectExpression(props)) {
      const hasChildrenProp = props.properties.some(
        prop =>
          (t.isObjectProperty(prop) || t.isObjectMethod(prop)) &&
          t.isIdentifier(prop.key) &&
          prop.key.name === 'children'
      );

      if (hasChildrenProp) {
        addWarning(
          state,
          `Component has both 'children' prop and children content. Children content will take priority.`,
          element
        );
        // Remove the children prop, let children content take priority
        props.properties = props.properties.filter(
          prop =>
            !(
              (t.isObjectProperty(prop) || t.isObjectMethod(prop)) &&
              t.isIdentifier(prop.key) &&
              prop.key.name === 'children'
            )
        );
      }
    }

    // Add children to props if they exist
    if (children.length > 0) {
      const childrenValue =
        children.length === 1 ? children[0] : t.arrayExpression(children);

      if (t.isObjectExpression(props)) {
        if (needsGetterWrapping(childrenValue)) {
          const getter = t.objectMethod(
            'get',
            t.identifier('children'),
            [],
            t.blockStatement([t.returnStatement(childrenValue)])
          );
          props.properties.push(getter);
        } else {
          props.properties.push(
            t.objectProperty(t.identifier('children'), childrenValue)
          );
        }
      }
    }

    propsArg = props;
  }

  return t.callExpression(
    t.identifier(state.importManager!.getName('component')),
    [t.identifier(componentName), propsArg]
  );
}

function isValidIdentifier(name: string): boolean {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name);
}

function createPropsObject(
  attributes: (t.JSXAttribute | t.JSXSpreadAttribute)[],
  state?: PluginState,
  element?: t.JSXElement
): t.ObjectExpression {
  const properties: (t.ObjectProperty | t.ObjectMethod | t.SpreadElement)[] =
    [];

  // Check for both class and classMap attributes (Issue #3)
  if (state && element) {
    const hasClass = attributes.some(
      attr =>
        t.isJSXAttribute(attr) &&
        t.isJSXIdentifier(attr.name) &&
        (attr.name.name === 'class' || attr.name.name === 'className')
    );
    const hasClassMap = attributes.some(
      attr =>
        t.isJSXAttribute(attr) &&
        t.isJSXIdentifier(attr.name) &&
        attr.name.name === 'classMap'
    );

    if (hasClass && hasClassMap) {
      addWarning(
        state,
        `Element has both 'class' and 'classMap' attributes. Both will be converted to the 'class' attribute and may conflict.`,
        element
      );
    }
  }

  for (const attr of attributes) {
    if (t.isJSXSpreadAttribute(attr)) {
      properties.push(t.spreadElement(attr.argument));
    } else if (t.isJSXAttribute(attr)) {
      const propName = getAttributeName(attr);
      const propValue = getAttributeValue(attr);

      if (propName && propValue) {
        const isValidId = isValidIdentifier(propName);

        // Check if value needs getter wrapping (function calls, member access)
        if (needsGetterWrapping(propValue)) {
          const key = isValidId
            ? t.identifier(propName)
            : t.stringLiteral(propName);
          const getter = t.objectMethod(
            'get',
            key,
            [],
            t.blockStatement([t.returnStatement(propValue)]),
            !isValidId
          );
          properties.push(getter);
        } else {
          const key = isValidId
            ? t.identifier(propName)
            : t.stringLiteral(propName);
          properties.push(t.objectProperty(key, propValue));
        }
      }
    }
  }

  return t.objectExpression(properties);
}

function getAttributeName(attr: t.JSXAttribute): string | null {
  if (t.isJSXIdentifier(attr.name)) {
    return attr.name.name;
  }
  if (t.isJSXNamespacedName(attr.name)) {
    return `${attr.name.namespace.name}:${attr.name.name.name}`;
  }
  return null;
}

function getAttributeValue(attr: t.JSXAttribute): t.Expression | null {
  if (!attr.value) {
    return t.booleanLiteral(true);
  }

  if (t.isStringLiteral(attr.value)) {
    return attr.value;
  }

  if (t.isJSXExpressionContainer(attr.value)) {
    return attr.value.expression as t.Expression;
  }

  return null;
}

function needsGetterWrapping(expression: t.Expression): boolean {
  // Issue #1: Inline functions don't need getter wrapping
  // Arrow functions and function expressions are static values themselves
  // The reactivity happens when they're called, not when they're defined
  if (
    t.isArrowFunctionExpression(expression) ||
    t.isFunctionExpression(expression)
  ) {
    return false;
  }

  // Arrays of functions also don't need wrapping if all elements are static
  if (t.isArrayExpression(expression)) {
    // If the array contains only literals, identifiers, or functions, no wrapping needed
    const allStatic = expression.elements.every(elem => {
      if (!elem || t.isSpreadElement(elem)) return false;
      return (
        t.isLiteral(elem) ||
        t.isIdentifier(elem) ||
        t.isArrowFunctionExpression(elem) ||
        t.isFunctionExpression(elem)
      );
    });
    if (allStatic) return false;
  }

  let hasDynamicAccess = false;

  function traverse(node: t.Node, depth: number = 0) {
    if (hasDynamicAccess) return;

    // Don't traverse into nested function bodies - they're evaluated later
    if (
      depth > 0 &&
      (t.isArrowFunctionExpression(node) || t.isFunctionExpression(node))
    ) {
      return;
    }

    // These indicate reactive access that needs getter wrapping
    if (t.isMemberExpression(node) || t.isCallExpression(node)) {
      hasDynamicAccess = true;
      return;
    }

    // Conditionals and logical expressions might access reactive values
    if (t.isConditionalExpression(node) || t.isLogicalExpression(node)) {
      // Traverse their parts
      for (const key in node) {
        const child = (node as any)[key];
        if (child && typeof child === 'object' && child.type) {
          traverse(child, depth + 1);
        }
      }
      return;
    }

    // Traverse children
    for (const key in node) {
      const child = (node as any)[key];
      if (child && typeof child === 'object') {
        if (Array.isArray(child)) {
          for (const item of child) {
            if (item && typeof item === 'object' && item.type) {
              traverse(item, depth + 1);
            }
          }
        } else if (child.type) {
          traverse(child, depth + 1);
        }
      }
    }
  }

  traverse(expression);
  return hasDynamicAccess;
}

// ============================================================================
// HTML Element Creation
// ============================================================================

function createHTMLElement(
  element: t.JSXElement,
  state: PluginState
): t.TaggedTemplateExpression {
  const tagName = getJSXElementName(element.openingElement.name);
  const builder = new TemplateBuilder();

  // Start opening tag
  builder.addStatic(`<${tagName}`);

  // Check for both class and classMap attributes (Issue #3)
  const attributes = element.openingElement.attributes;
  const hasClass = attributes.some(
    attr =>
      t.isJSXAttribute(attr) &&
      t.isJSXIdentifier(attr.name) &&
      (attr.name.name === 'class' || attr.name.name === 'className')
  );
  const hasClassMap = attributes.some(
    attr =>
      t.isJSXAttribute(attr) &&
      t.isJSXIdentifier(attr.name) &&
      attr.name.name === 'classMap'
  );

  if (hasClass && hasClassMap) {
    addWarning(
      state,
      `Element has both 'class' and 'classMap' attributes. Both will be converted to the 'class' attribute and may conflict.`,
      element
    );
  }

  // Process attributes
  const processedAttrs =
    state.attributeProcessor!.processAttributes(attributes);

  for (const attr of processedAttrs) {
    if (attr.type === 'static') {
      builder.addStatic(attr.content!);
    } else if (attr.type === 'dynamic') {
      builder.addStatic(` ${attr.name}=`);
      builder.addExpression(attr.expression!);
    } else if (attr.type === 'directive') {
      builder.addStatic(` `);
      builder.addExpression(attr.expression!);
    }
  }

  // Handle self-closing vs regular elements
  if (isSelfClosingTag(tagName)) {
    builder.addStatic(' />');
  } else {
    builder.addStatic('>');

    // Process children
    const childResults = processChildrenForTemplate(element.children, state);
    for (const result of childResults) {
      if (result.type === 'static') {
        builder.addStatic(result.content);
      } else {
        builder.addExpression(result.expression);
      }
    }

    builder.addStatic(`</${tagName}>`);
  }

  return t.taggedTemplateExpression(
    t.identifier(state.importManager!.getName('html')),
    builder.build()
  );
}

// ============================================================================
// Children Processing
// ============================================================================

type ChildResult =
  | { type: 'static'; content: string }
  | { type: 'dynamic'; expression: t.Expression };

function processChildren(
  children: (
    | t.JSXElement
    | t.JSXFragment
    | t.JSXExpressionContainer
    | t.JSXText
    | t.JSXSpreadChild
  )[],
  state: PluginState
): t.Expression[] {
  const processedChildren: t.Expression[] = [];

  for (const child of children) {
    if (t.isJSXText(child)) {
      const text = child.value.trim();
      if (text) {
        processedChildren.push(t.stringLiteral(text));
      }
    } else if (t.isJSXExpressionContainer(child)) {
      if (t.isExpression(child.expression)) {
        processedChildren.push(child.expression);
      }
    } else if (t.isJSXElement(child)) {
      const tagName = getJSXElementName(child.openingElement.name);
      if (isComponent(tagName)) {
        state.importManager!.markNeeded('component');
        state.importManager!.markNeeded('html');
        // Wrap component call in html template literal
        const componentCall = createComponentCall(child, tagName, state);
        const templateLiteral = t.taggedTemplateExpression(
          t.identifier(state.importManager!.getName('html')),
          t.templateLiteral(
            [
              t.templateElement({ raw: '', cooked: '' }, false),
              t.templateElement({ raw: '', cooked: '' }, true),
            ],
            [componentCall]
          )
        );
        processedChildren.push(templateLiteral);
      } else {
        state.importManager!.markNeeded('html');
        processedChildren.push(createHTMLElement(child, state));
      }
    } else if (t.isJSXFragment(child)) {
      const fragmentChildren = processChildren(child.children, state);
      processedChildren.push(...fragmentChildren);
    }
  }

  return processedChildren;
}

function processChildrenForTemplate(
  children: (
    | t.JSXElement
    | t.JSXFragment
    | t.JSXExpressionContainer
    | t.JSXText
    | t.JSXSpreadChild
  )[],
  state: PluginState
): ChildResult[] {
  const results: ChildResult[] = [];

  for (const child of children) {
    if (t.isJSXText(child)) {
      const text = child.value;
      if (text.trim()) {
        results.push({ type: 'static', content: text });
      } else if (text.includes('\n')) {
        // Skip whitespace-only with newlines
        continue;
      } else {
        // Preserve inline whitespace
        results.push({ type: 'static', content: text });
      }
    } else if (t.isJSXExpressionContainer(child)) {
      if (t.isExpression(child.expression)) {
        results.push({ type: 'dynamic', expression: child.expression });
      }
    } else if (t.isJSXElement(child)) {
      const tagName = getJSXElementName(child.openingElement.name);
      if (isComponent(tagName)) {
        state.importManager!.markNeeded('component');
        results.push({
          type: 'dynamic',
          expression: createComponentCall(child, tagName, state),
        });
      } else {
        // Check if we can inline as static HTML
        if (canInlineAsStaticHTML(child)) {
          results.push({
            type: 'static',
            content: convertElementToStaticHTML(child),
          });
        } else {
          // Inline the element structure in the template
          const elementResults = inlineElementInTemplate(child, state);
          results.push(...elementResults);
        }
      }
    } else if (t.isJSXFragment(child)) {
      const fragmentResults = processChildrenForTemplate(child.children, state);
      results.push(...fragmentResults);
    }
  }

  return results;
}

function canInlineAsStaticHTML(element: t.JSXElement): boolean {
  // Can inline if element has no dynamic attributes and all children are static
  const hasOnlyStaticAttributes = element.openingElement.attributes.every(
    attr => {
      if (t.isJSXAttribute(attr)) {
        const attrValue = getAttributeValue(attr);
        return (
          !attrValue ||
          t.isStringLiteral(attrValue) ||
          t.isBooleanLiteral(attrValue)
        );
      }
      return false; // spread attributes are dynamic
    }
  );

  if (!hasOnlyStaticAttributes) return false;

  // Check if all children are static text or static HTML elements
  return element.children.every(child => {
    if (t.isJSXText(child)) return true;
    if (t.isJSXElement(child)) {
      const tagName = getJSXElementName(child.openingElement.name);
      return !isComponent(tagName) && canInlineAsStaticHTML(child);
    }
    return false; // expressions or fragments are dynamic
  });
}

function convertElementToStaticHTML(element: t.JSXElement): string {
  const tagName = getJSXElementName(element.openingElement.name);
  const isSelfClosing = isSelfClosingTag(tagName);

  let html = `<${tagName}`;

  // Add attributes
  for (const attr of element.openingElement.attributes) {
    if (t.isJSXAttribute(attr)) {
      const attrName = getAttributeName(attr);
      const attrValue = getAttributeValue(attr);

      if (attrName && attrValue) {
        const normalizedAttrName =
          attrName === 'className' ? 'class' : attrName;

        if (t.isStringLiteral(attrValue)) {
          html += ` ${normalizedAttrName}="${attrValue.value}"`;
        } else if (t.isBooleanLiteral(attrValue) && attrValue.value) {
          html += ` ${normalizedAttrName}`;
        }
      }
    }
  }

  if (isSelfClosing) {
    html += ' />';
  } else {
    html += '>';

    // Add children
    for (const child of element.children) {
      if (t.isJSXText(child)) {
        html += child.value;
      } else if (t.isJSXElement(child)) {
        html += convertElementToStaticHTML(child);
      }
    }

    html += `</${tagName}>`;
  }

  return html;
}

function inlineElementInTemplate(
  element: t.JSXElement,
  state: PluginState
): ChildResult[] {
  const tagName = getJSXElementName(element.openingElement.name);
  const results: ChildResult[] = [];
  let currentPart = `<${tagName}`;

  // Process attributes using AttributeProcessor
  const processedAttrs = state.attributeProcessor!.processAttributes(
    element.openingElement.attributes
  );

  for (const attr of processedAttrs) {
    if (attr.type === 'static') {
      currentPart += attr.content;
    } else if (attr.type === 'dynamic') {
      currentPart += ` ${attr.name}=`;
      results.push({ type: 'static', content: currentPart });
      results.push({ type: 'dynamic', expression: attr.expression! });
      currentPart = '';
    } else if (attr.type === 'directive') {
      currentPart += ` `;
      results.push({ type: 'static', content: currentPart });
      results.push({ type: 'dynamic', expression: attr.expression! });
      currentPart = '';
    }
  }

  // Handle self-closing vs regular elements
  if (isSelfClosingTag(tagName)) {
    currentPart += ' />';
    results.push({ type: 'static', content: currentPart });
  } else {
    currentPart += '>';

    // Process children
    const childResults = processChildrenForTemplate(element.children, state);
    if (childResults.length === 0) {
      // No children, just close the tag
      currentPart += `</${tagName}>`;
      results.push({ type: 'static', content: currentPart });
    } else {
      // Add opening tag part
      if (currentPart) {
        results.push({ type: 'static', content: currentPart });
      }

      // Add children
      results.push(...childResults);

      // Add closing tag
      results.push({ type: 'static', content: `</${tagName}>` });
    }
  }

  return results;
}
