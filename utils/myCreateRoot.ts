import { Fragment, type ElementProps, type RemixElement, type RemixNode } from '@remix-run/component/jsx-runtime'

export const TEXT_NODE = Symbol('TEXT_NODE')

export type VNode = {
  type: symbol | string | Function
  props?: ElementProps
  key?: string
  _parent?: VNode
  _children?: VNode[]
  _dom?: unknown
  _text?: string
  _content?: VNode
}

function flatMapChildrenToVNodes(node: RemixElement): VNode[] {
  return 'children' in node.props
    ? Array.isArray(node.props.children)
      ? node.props.children.flat(Infinity).map(toVNode)
      : [toVNode(node.props.children)]
    : []
}

function flattenRemixNodeArray(nodes: RemixNode[], out: RemixNode[] = []): RemixNode[] {
  for (let child of nodes) {
    if (Array.isArray(child)) {
      flattenRemixNodeArray(child, out)
    } else {
      out.push(child)
    }
  }
  return out
}

export function toVNode(node: RemixNode): VNode {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return { type: TEXT_NODE, _text: '' }
  }

  if (typeof node === 'string' || typeof node === 'number' || typeof node === 'bigint') {
    return { type: TEXT_NODE, _text: String(node) }
  }

  if (Array.isArray(node)) {
    let flatChildren = flattenRemixNodeArray(node)
    return { type: Fragment, _children: flatChildren.map(toVNode) }
  }

  let children = node.props.innerHTML != null ? [] : flatMapChildrenToVNodes(node)
  return { type: node.type, key: node.key, props: node.props, _children: children }
}

export function myCreateRoot(container: HTMLElement) {
  let vroot: VNode | null = null

  return {
    render(element: RemixElement) {
      let next = toVNode(element)
      diffVNodes(vroot, next, container)
      vroot = next
    },
  }
}

function diffVNodes(curr: VNode | null, next: VNode, domParent: ParentNode) {
  if (curr === null) {
    insert(next, domParent)
  } else {
    replace(curr, next, domParent)
  }
}

function insert(node: VNode, domParent: ParentNode) {
  // テキスト
  if (node.type === TEXT_NODE) {
    let dom = document.createTextNode(node._text ?? '')
    node._dom = dom
    domParent.appendChild(dom)
    return
  }

  // フラグメント
  if (node.type === Fragment) {
    for (let child of node._children ?? []) {
      insert(child, domParent)
    }
    return
  }

  // ホスト要素 (div, button, span, ...)
  if (typeof node.type === 'string') {
    let dom = document.createElement(node.type)
    for (let child of node._children ?? []) {
      insert(child, dom)
    }
    node._dom = dom
    domParent.appendChild(dom)
    return
  }

  // コンポーネント
  if (typeof node.type === 'function') {
    let { setup, ...rest } = node.props ?? {}
    let renderFn = node.type({}, setup)
    let element = renderFn(rest)
    let content = toVNode(element)
    node._content = content
    insert(content, domParent)
    return
  }
}

function replace(curr: VNode, next: VNode, domParent: ParentNode) {
  remove(curr, domParent)
  insert(next, domParent)
}

function remove(node: VNode, domParent: ParentNode) {
  // ホスト要素・テキスト
  if (node._dom) {
    domParent.removeChild(node._dom as Node)
    return
  }

  // フラグメント
  if (node.type === Fragment) {
    for (let child of node._children ?? []) {
      remove(child, domParent)
    }
    return
  }

  // コンポーネント
  if (node._content) {
    remove(node._content, domParent)
    return
  }
}
