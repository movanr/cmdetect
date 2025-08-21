/*import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addProduct, getProducts, GetUsersQuery } from "../queries/users";
import { execute } from "../graphql/execute";
import type { AddProductMutationVariables } from "@/graphql/graphql";

export const Route = createFileRoute("/products")({
  component: Products,
});

function Products() {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: () => execute(getProducts),
  });
  const { mutateAsync } = useMutation({
    mutationFn: (vars: AddProductMutationVariables) =>
      execute(addProduct, vars),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["products"] });
    },
  });
  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>Error loading users: {error.message}</div>;

  const addProductHandler = () => {
    mutateAsync({ myName: "Tobi3" });
  };

  return (
    <div>
      <button onClick={addProductHandler}>foo bar</button>
      <h1>Products</h1>
      <div>
        {data?.products.map((product) => (
          <div>{product.name}</div>
        ))}
      </div>
    </div>
  );
}*/
