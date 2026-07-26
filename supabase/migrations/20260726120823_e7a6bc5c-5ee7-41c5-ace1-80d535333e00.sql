REVOKE ALL ON FUNCTION public.decrement_inventory_for_confirmed_order() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.decrement_inventory_for_confirmed_order() FROM anon;
REVOKE ALL ON FUNCTION public.decrement_inventory_for_confirmed_order() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_inventory_for_confirmed_order() TO service_role;