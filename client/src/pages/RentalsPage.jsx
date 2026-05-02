import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import PageHeader from "../components/ui/PageHeader";
import RentalForm from "../components/rentals/RentalForm";
import RentalTable from "../components/rentals/RentalTable";

// here i refetch rentals whenever the form or table mutates something on the server
export default function RentalsPage() {
  const [rentals, setRentals] = useState([]);

  const loadRentals = useCallback(async () => {
    const res = await axios.get("/api/rentals");
    setRentals(res.data);
  }, []);

  useEffect(() => {
    loadRentals();
  }, [loadRentals]);

  return (
    <div>
      <PageHeader
        title="Rentals"
        subtitle={`${rentals.length} booking${rentals.length !== 1 ? "s" : ""} total`}
        action={<RentalForm onSuccess={loadRentals} />}
      />

      <RentalTable rentals={rentals} onRefresh={loadRentals} />
    </div>
  );
}
