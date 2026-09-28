REVOKE EXECUTE ON FUNCTION public.check_voucher(text, uuid, numeric, text[], text[]) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.apply_order_voucher() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.record_voucher_redemption() FROM PUBLIC, anon, authenticated;