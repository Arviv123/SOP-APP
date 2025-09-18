import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { login } from "../../shopify.server";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Shop chat agent reference app</h1>
        <p className={styles.text}>
          A reference app for shop chat agent.
        </p>
        {showForm && (
          <div className={styles.form}>
            <h2>Install this app in your Shopify store</h2>
            <Form method="get" action="/app">
              <label htmlFor="shop">
                Enter your shop domain:
              </label>
              <input
                type="text"
                id="shop"
                name="shop"
                placeholder="your-store.myshopify.com"
                required
              />
              <button type="submit">Install App</button>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
}
