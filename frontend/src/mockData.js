// Mock data mirroring the real MySQL schema.
// When you connect the backend, each page will replace its useState(initial...)
// with a real call from services/api.js instead.

export const initialRoomTypes = [
  { id: 1, name: "Single", base_price: 350 },
  { id: 2, name: "Double", base_price: 550 },
  { id: 3, name: "Suite", base_price: 950 },
];

export const initialRooms = [
  { id: 1, room_number: "101", room_type_id: 1, status: "available" },
  { id: 2, room_number: "102", room_type_id: 1, status: "occupied" },
  { id: 3, room_number: "103", room_type_id: 2, status: "available" },
  { id: 4, room_number: "201", room_type_id: 2, status: "available" },
  { id: 5, room_number: "202", room_type_id: 3, status: "maintenance" },
];

export const initialGuests = [
  { id: 1, full_name: "Chola Mwape", phone: "+260 97 123 4567", email: "chola.m@example.com" },
  { id: 2, full_name: "James Banda", phone: "+260 96 765 4321", email: "j.banda@example.com" },
];

export const initialReservations = [
  { id: 1, guest_id: 1, room_id: 2, check_in_date: "2026-09-03", check_out_date: "2026-09-06", status: "checked_in", total_amount: 1050 },
  { id: 2, guest_id: 2, room_id: 3, check_in_date: "2026-09-05", check_out_date: "2026-09-08", status: "booked", total_amount: 1650 },
];

export const initialPayments = [
  { id: 1, reservation_id: 1, amount: 1050, method: "mobile_money", status: "paid" },
  { id: 2, reservation_id: 2, amount: 1650, method: "cash", status: "pending" },
];

export const initialStaff = [
  { id: 1, full_name: "System Administrator", email: "admin@sunbeamlodge.co.zm", role: "Administrator" },
  { id: 2, full_name: "Mutinta Zulu", email: "m.zulu@sunbeamlodge.co.zm", role: "Receptionist" },
];
