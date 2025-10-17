export type Component<Props = any> = (
  props: Props
) => unknown | (() => unknown);

export type RenderOptions<Props> = {
  props: Props;
  target: HTMLElement;
};
