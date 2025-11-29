export interface PurchaseRequestDto {
  userId: number;
  productId: number;
}

export interface PurchaseResponseDto {
  userId: number;
  productId: number;
  purchaseId: number;
  balance: number;
}
