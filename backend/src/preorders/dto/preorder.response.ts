export interface PreorderResponse {
  status: 'registered';
}

export function toPreorderResponse(): PreorderResponse {
  return { status: 'registered' };
}
