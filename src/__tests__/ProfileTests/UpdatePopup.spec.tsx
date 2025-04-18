import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UpdatePopup from "../../Components/Profile/UpdatePopup";
import "@testing-library/jest-dom";

const dummyFile = new File(["dummy content"], "dummy.png", { type: "image/png" });

describe("UpdatePopup Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders the Edit button initially", () => {
    const onUpdate = jest.fn();
    render(<UpdatePopup onUpdate={onUpdate} />);
    const editButton = screen.getByRole("button", { name: /Edit/i });
    expect(editButton).toBeInTheDocument();
  });

  test("opens the popup when Edit button is clicked", () => {
    const onUpdate = jest.fn();
    render(<UpdatePopup onUpdate={onUpdate} />);
    const editButton = screen.getByRole("button", { name: /Edit/i });
    fireEvent.click(editButton);
    expect(screen.getByText(/Edit Profile/i)).toBeInTheDocument();
  });

  test("submits the form, calls onUpdate, and closes the modal on successful update", async () => {
    const onUpdate = jest.fn();

    (global.fetch as jest.Mock) = jest.fn(() =>
      Promise.resolve({
        status: 200,
      })
    );

    jest.spyOn(localStorage, "removeItem");

    const { container } = render(<UpdatePopup onUpdate={onUpdate} />);
    fireEvent.click(screen.getByRole("button", { name: /Edit/i }));

    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "johndoe" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "john@example.com" },
    });

    const fileInput = container.querySelector("#editPicture") as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    fireEvent.change(fileInput, { target: { files: [dummyFile] } });

    const saveButton = screen.getByRole("button", { name: /Save/i });
    fireEvent.click(saveButton);

    await waitFor(() => expect(onUpdate).toHaveBeenCalled());

    await waitFor(() =>
      expect(screen.queryByText(/Edit Profile/i)).not.toBeInTheDocument()
    );
  });

  test("closes the popup when Cancel button is clicked", () => {
    const onUpdate = jest.fn();
    render(<UpdatePopup onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole("button", { name: /Edit/i }));
    expect(screen.getByText(/Edit Profile/i)).toBeInTheDocument();

    const cancelButton = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(screen.queryByText(/Edit Profile/i)).not.toBeInTheDocument();
  });

  test("closes the popup when clicking outside the modal dialog", () => {
    const onUpdate = jest.fn();
    const { container } = render(<UpdatePopup onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole("button", { name: /Edit/i }));
    expect(screen.getByText(/Edit Profile/i)).toBeInTheDocument();

    const modalOverlay = container.querySelector("div.modal");
    expect(modalOverlay).toBeInTheDocument();

    fireEvent.click(modalOverlay!);

    expect(screen.queryByText(/Edit Profile/i)).not.toBeInTheDocument();
  });
});