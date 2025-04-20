import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Profile from "../../pages/Profile";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../../Components/Contexts";
import UpdatePopup from "../../Components/Profile/UpdatePopup";

const mockedUsedNavigate = jest.fn();
jest.mock("react-router-dom", () => {
    const actual = jest.requireActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockedUsedNavigate,
    };
});

jest.mock("../../Components/Profile/UpdatePopup", () => ({
    __esModule: true,
    default: () => (
        <div data-testid="update-popup">UpdatePopup</div>
    )
}));

jest.mock("@react-oauth/google", () => ({
    GoogleLogin: ({
        onSuccess,
        onError,
    }: {
        onSuccess: (credentialResponse: any) => void;
        onError: () => void;
    }) => (
        <button
            data-testid="google-login"
            onClick={() => onSuccess({ credential: "dummy-google-credential" })}
        >
            GoogleLoginMock
        </button>
    ),
}));

const dummyProfileWithGoogle = {
    picture: "http://test.com/profile.jpg",
    account: { firstname: "John", lastname: "Doe", email: "john.doe@example.com" },
    username: "johndoe",
    googleId: "google-connected",
};

const dummyProfileWithoutGoogle = {
    picture: "http://test.com/profile.jpg",
    account: { firstname: "Jane", lastname: "Smith", email: "jane.smith@example.com" },
    username: "smithjane",
};

beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
});

describe("Profile Component", () => {
    test("renders profile using cached userInfo", async () => {
        localStorage.setItem("userInfo", JSON.stringify(dummyProfileWithGoogle));

        render(
            <AuthContext.Provider value={{ isLoggedIn: true, setLogInStatus: jest.fn() }}>
                <MemoryRouter>
                    <Profile />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        await waitFor(() => {
            expect(screen.getByRole("img")).toHaveAttribute("src", dummyProfileWithGoogle.picture);
        });

        expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
        expect(screen.getByText(/johndoe/i)).toBeInTheDocument();
        expect(screen.getByText(/john\.doe@example\.com/i)).toBeInTheDocument();

        expect(screen.getByText(/Connected/i)).toBeInTheDocument();

        expect(screen.getByTestId("update-popup")).toBeInTheDocument();

        expect(screen.getByRole("button", { name: /Logout/i })).toBeInTheDocument();
    });

    test("fetches profile info when not cached", async () => {
        localStorage.removeItem("userInfo");
        localStorage.setItem("token", "dummy-token");

        const fetchGetMock = jest.spyOn(global, "fetch").mockResolvedValue({
            status: 200,
            json: () => Promise.resolve(dummyProfileWithoutGoogle),
        } as unknown as Response);

        render(
            <AuthContext.Provider value={{ isLoggedIn: true, setLogInStatus: jest.fn() }}>
                <MemoryRouter>
                    <Profile />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        await waitFor(() => {
            expect(fetchGetMock).toHaveBeenCalledWith(
                "http://3.144.40.72:5000/user/profile",
                expect.any(Object)
            );
        });

        await waitFor(() => {
            expect(screen.getByText(/Jane\s*Smith/i)).toBeInTheDocument();
        });

        expect(screen.getByText(/smithjane/i)).toBeInTheDocument();
        expect(screen.getByText(/jane\.smith@example\.com/i)).toBeInTheDocument();

        expect(screen.getByTestId("google-login")).toBeInTheDocument();
    });


    test("logout button clears localStorage, updates auth and navigates", async () => {

        localStorage.setItem("token", "dummy-token");
        localStorage.setItem("userInfo", JSON.stringify(dummyProfileWithGoogle));
        const setLogInStatusMock = jest.fn();

        render(
            <AuthContext.Provider value={{ isLoggedIn: true, setLogInStatus: setLogInStatusMock }}>
                <MemoryRouter>
                    <Profile />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        const logoutButton = screen.getByRole("button", { name: /Logout/i });
        fireEvent.click(logoutButton);

        expect(localStorage.getItem("token")).toBeNull();
        expect(localStorage.getItem("userInfo")).toBeNull();

        expect(setLogInStatusMock).toHaveBeenCalledWith(false);
        expect(mockedUsedNavigate).toHaveBeenCalledWith("/");
    });

    test("handles successful Google login", async () => {
        localStorage.setItem("token", "dummy-token");
        localStorage.removeItem("userInfo");

        const fetchGetMock = jest.spyOn(global, "fetch").mockResolvedValueOnce({
            status: 200,
            json: () => Promise.resolve(dummyProfileWithoutGoogle),
        } as unknown as Response);

        const fetchGoogleMock = jest.spyOn(global, "fetch").mockResolvedValueOnce({
            status: 200,
            json: () => Promise.resolve({ token: "dummy-google-token" }),
        } as unknown as Response);

        render(
            <AuthContext.Provider value={{ isLoggedIn: true, setLogInStatus: jest.fn() }}>
                <MemoryRouter>
                    <Profile />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        await waitFor(() => {
            expect(fetchGetMock).toHaveBeenCalledWith(
                "http://3.144.40.72:5000/user/profile",
                expect.any(Object)
            );
        });

        const googleButton = screen.getByTestId("google-login");
        fireEvent.click(googleButton);

        await waitFor(() => {
            expect(fetchGoogleMock).toHaveBeenCalledWith(
                "http://3.144.40.72:5000/auth/google",
                expect.objectContaining({
                    method: "PUT",
                    headers: expect.objectContaining({
                        "Authorization": expect.stringContaining("Bearer dummy-token"),
                        "googleToken": expect.stringContaining("Bearer dummy-google-credential"),
                    }),
                })
            );
        });
    });
});