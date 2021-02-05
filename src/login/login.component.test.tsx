import "@testing-library/jest-dom";
import Login from "./login.component";
import { useState } from "react";
import { cleanup, fireEvent, wait } from "@testing-library/react";
import { performLogin } from "./login.resource";
import { setSessionLocation } from "../choose-location/choose-location.resource";
import { useCurrentUser } from "../CurrentUserContext";
import renderWithRouter from "../test-helpers/render-with-router";
import userEvent from "@testing-library/user-event";

const mockedLogin = performLogin as jest.Mock;

jest.mock("./login.resource", () => ({
  performLogin: jest.fn(),
}));

const mockedSetSessionLocation = setSessionLocation as jest.Mock;

jest.mock("../choose-location/choose-location.resource", () => ({
  setSessionLocation: jest.fn(),
}));

const mockedUseCurrentUser = useCurrentUser as jest.Mock;

jest.mock("../CurrentUserContext", () => ({
  useCurrentUser: jest.fn(),
}));

const loginLocations = [
  { uuid: "111", display: "Earth" },
  { uuid: "222", display: "Mars" },
];

describe(`<Login />`, () => {
  beforeEach(() => {
    mockedLogin.mockReset();
    mockedSetSessionLocation.mockReset();
    mockedUseCurrentUser.mockReset();
  });

  afterEach(cleanup);

  it(`renders a login form`, () => {
    const wrapper = renderWithRouter(Login, { loginLocations: loginLocations });

    wrapper.getByRole("textbox", { name: /Username/i });
    wrapper.getByRole("button", { name: /Continue/i });
  });

  it(`should return user focus to username input when input is invalid`, () => {
    const wrapper = renderWithRouter(Login, { loginLocations: loginLocations });

    expect(
      wrapper.getByRole("textbox", { name: /username/i })
    ).toBeInTheDocument();
    fireEvent.change(wrapper.getByRole("textbox", { name: /Username/i }), {
      target: { value: "" },
    });
    const continueButton = wrapper.getByRole("button", { name: /Continue/i });
    fireEvent.click(continueButton);
    expect(wrapper.getByRole("textbox", { name: /username/i })).toHaveFocus();

    fireEvent.change(wrapper.getByRole("textbox", { name: /Username/i }), {
      target: { value: "yoshi" },
    });
    fireEvent.click(continueButton);
    expect(wrapper.getByLabelText(/password/i)).toHaveFocus();
  });

  it(`makes an API request when you submit the form`, async () => {
    mockedLogin.mockReturnValue(Promise.resolve({ some: "data" }));

    const wrapper = renderWithRouter(Login, { loginLocations: loginLocations });

    expect(performLogin).not.toHaveBeenCalled();
    fireEvent.change(wrapper.getByRole("textbox", { name: /Username/i }), {
      target: { value: "yoshi" },
    });
    fireEvent.click(wrapper.getByRole("button", { name: /Continue/i }));
    fireEvent.change(wrapper.getByLabelText("password"), {
      target: { value: "no-tax-fraud" },
    });
    fireEvent.click(wrapper.getByRole("button", { name: /submit/i }));
    await wait();
    expect(performLogin).toHaveBeenCalledWith("yoshi", "no-tax-fraud");
  });

  it(`send the user to the location select page on login if there is more than one location`, async () => {
    let refreshUser = (user: any) => {};
    mockedLogin.mockImplementation(() => {
      refreshUser({
        display: "my name",
      });
      return Promise.resolve({ data: { authenticated: true } });
    });
    mockedUseCurrentUser.mockImplementation(() => {
      const [user, setUser] = useState();
      refreshUser = setUser;
      return user;
    });

    const wrapper = renderWithRouter(Login, { loginLocations: loginLocations });

    fireEvent.change(wrapper.getByRole("textbox", { name: /Username/i }), {
      target: { value: "yoshi" },
    });
    fireEvent.click(wrapper.getByRole("button", { name: /Continue/i }));
    fireEvent.change(wrapper.getByLabelText("password"), {
      target: { value: "no-tax-fraud" },
    });
    fireEvent.click(wrapper.getByRole("button", { name: /submit/i }));
    await wait();

    expect(wrapper.history.location.pathname).toBe("/login/location");
  });
});
