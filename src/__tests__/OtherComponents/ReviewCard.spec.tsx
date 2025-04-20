import React from "react";
import { render, screen } from "@testing-library/react";
import ReviewCard, { ReviewCardProps } from "../../Components/ReviewCard";

jest.mock("../../Components/StarRating", () => ({
    __esModule: true,
    default: ({ rating, outOf }: { rating: number; outOf: number }) => (
        <div data-testid="star-rating">{`StarRating: ${rating}/${outOf}`}</div>
    ),
}));

describe("ReviewCard", () => {
    test("renders reviewer name, numeric rating, star rating and description using default image", () => {
        const props: ReviewCardProps = {
            reviewerName: "John Doe",
            rating: 4.25,
            description: "This product is awesome!",
        };

        render(<ReviewCard {...props} />);

        expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("John Doe");


        const image = screen.getByRole("img", { name: /John Doe profile/i });
        expect(image).toHaveAttribute("src", "https://www.gravatar.com/avatar/?d=mp");

        expect(screen.getByText("4.3")).toBeInTheDocument();

        expect(screen.getByTestId("star-rating")).toHaveTextContent("StarRating: 4.25/5");

        expect(screen.getByText("This product is awesome!")).toBeInTheDocument();
    });

    test("still uses the default image even if a reviewerPicture is provided", () => {
        const props: ReviewCardProps = {
            reviewerName: "Alice Example",
            reviewerPicture: "https://example.com/alice.png",
            rating: 5,
            description: "Outstanding experience!",
        };

        render(<ReviewCard {...props} />);

        const image = screen.getByRole("img", { name: /Alice Example profile/i });
        expect(image).toHaveAttribute("src", "https://www.gravatar.com/avatar/?d=mp");
    });
});