export interface Step {
  key: string;
  isValid?: () => boolean;
  isCompleted?: () => boolean;
}
