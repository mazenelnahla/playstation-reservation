export function formatSession(row) {
  if (!row) return null;
  const startTime = row.startTime || row.Date_in || "";
  const customerName = row.customerName || row.CustomerName || "";
  const customerPhone = row.customerPhone || row.CustomerPhoneNumber || "";
  const stationType = row.stationType || row.Device_Type || "";
  const stationName = row.stationName || row.VendorName || "";
  const gameType = row.gameType || row.ModelName || "";
  const sessionNotes = row.sessionNotes || row.issue || "";
  const hourlyRate = row.hourlyRate || row.MaintinancePrice || "";
  const endTime = row.endTime !== undefined ? row.endTime : row.Date_out;
  const staffMember = row.staffMember !== undefined ? row.staffMember : row.DoneBy;
  const notes = row.notes !== undefined ? row.notes : row.Notes;

  return {
    id: row.id,
    startTime,
    customerName,
    customerPhone,
    stationType,
    stationName,
    gameType,
    sessionNotes,
    hourlyRate,
    endTime,
    staffMember,
    notes,
    // Legacy field aliases
    Date_in: startTime,
    CustomerName: customerName,
    CustomerPhoneNumber: customerPhone,
    Device_Type: stationType,
    VendorName: stationName,
    ModelName: gameType,
    issue: sessionNotes,
    MaintinancePrice: hourlyRate,
    Date_out: endTime,
    DoneBy: staffMember,
    Notes: notes,
  };
}
