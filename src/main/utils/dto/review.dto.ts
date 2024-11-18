
// @comment did you forget api property ?
export class CreateReviewDto {
  customerId: number;
  carId: number;
  rating: number; // ค่าระหว่าง 1-5
  comment?: string;
}
