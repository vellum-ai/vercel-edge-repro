export async function loader() {
  throw new Error("Oops! Something bad happened.");
}

export default function Component() {
  return <p>Error</p>;
}
