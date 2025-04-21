import { renderHook, act } from "@testing-library/react-hooks";
import useIngredients from "../../Components/SmartFridge/useIngredients";

describe("useIngredients", () => {
  it("fetches ingredients successfully", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useIngredients("mock-token"));
    await waitForNextUpdate();
    expect(result.current.ingredients).toBeDefined();
  });
});