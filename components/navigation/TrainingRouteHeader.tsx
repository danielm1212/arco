import type { ReactNode } from "react";
import { PageHeader } from "./PageHeader";
import { TrainingSubnav, type TrainingSubview } from "./TrainingSubnav";

/**
 * Wspólny chrome czterech podwidoków przestrzeni Trening.
 *
 * Dziś zachowuje brandowy `TrainingHeader` z passą i monogramem. Plany,
 * Postępy, Ciało i Historia są równorzędnymi podwidokami: mają jeden lekki
 * nagłówek tytułowy, a pod nim tę samą lokalną nawigację.
 */
export function TrainingRouteHeader({
  active,
  title,
  action,
}: {
  active: TrainingSubview;
  title: string;
  action?: ReactNode;
}) {
  return (
    <>
      <PageHeader title={title} mode="none" action={action} />
      <TrainingSubnav active={active} />
    </>
  );
}
