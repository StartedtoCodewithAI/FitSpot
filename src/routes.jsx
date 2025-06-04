import Profile from "./pages/Profile";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/gyms", element: <Gyms /> },
      { path: "/profile", element: <Profile /> }
    ]
  }
]);
