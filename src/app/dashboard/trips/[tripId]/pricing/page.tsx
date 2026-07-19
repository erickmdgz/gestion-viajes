import Link from "next/link";
import { notFound } from "next/navigation";
import { getTripWithParticipants, listPriceTiersForTrip } from "@/lib/trips";
import { countConfirmedParticipants, resolvePriceTier } from "@/lib/priceTiers";
import { addPriceTier } from "@/app/dashboard/trips/[tripId]/pricing/actions";

// Live price tier by confirmed group size (FR-013): shows which band the
// current confirmed count falls into, recomputed on demand on every render
// (no accompanying-professor exclusion yet — FR-022 is a separate,
// not-yet-built feature; documented gap, see docs_en/07_data_model.md).
export default async function TripPricingPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { tripId } = await params;
  const { error } = await searchParams;
  const trip = await getTripWithParticipants(tripId);
  if (!trip) notFound();

  const tiers = await listPriceTiersForTrip(tripId);
  const confirmedCount = countConfirmedParticipants(trip.participants);
  const tier = resolvePriceTier(confirmedCount, tiers);

  const addPriceTierForTrip = addPriceTier.bind(null, tripId);

  return (
    <main className="wide">
      <h1>Pricing — {trip.name}</h1>
      <p>
        <Link href={`/dashboard/trips/${tripId}`}>&larr; Back to roster</Link>
      </p>

      <div className="card">
        <p>
          <strong>Confirmed:</strong> {confirmedCount}
        </p>
        {tier ? (
          <p>
            <strong>Tier:</strong> {tier.minSize}–{tier.maxSize} — ${tier.price}
          </p>
        ) : (
          <p>
            <strong>No tier — below minimum.</strong>
          </p>
        )}
      </div>

      <table>
        <thead>
          <tr>
            <th>Min</th>
            <th>Max</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {tiers.map((t) => (
            <tr key={t.id}>
              <td>{t.minSize}</td>
              <td>{t.maxSize}</td>
              <td>
                ${t.price}
                {tier?.id === t.id && <span className="badge-current">CURRENT</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <form className="card" action={addPriceTierForTrip}>
        <h2>Add tier</h2>
        <label htmlFor="minSize">Min size</label>
        <input id="minSize" name="minSize" type="number" min="0" required />

        <label htmlFor="maxSize">Max size</label>
        <input id="maxSize" name="maxSize" type="number" min="0" required />

        <label htmlFor="price">Price</label>
        <input id="price" name="price" type="number" min="0" required />

        <button type="submit">Add tier</button>

        {error && <p className="error">{error}</p>}
      </form>
    </main>
  );
}
