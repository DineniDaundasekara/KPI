$connString = "Server=NOVANODE\SQLEXPRESS01;Database=NWKPI;Trusted_Connection=True;TrustServerCertificate=True;"
$conn = New-Object System.Data.SqlClient.SqlConnection $connString
try {
    $conn.Open()
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = "SELECT Id, No, Kpi, Platform FROM TmActivityPlans"
    $adapter = New-Object System.Data.SqlClient.SqlDataAdapter $cmd
    $dt = New-Object System.Data.DataTable
    $adapter.Fill($dt) | Out-Null
    
    if ($dt.Rows.Count -eq 0) {
        Write-Host "No records found in the database."
    } else {
        $dt | Format-Table -AutoSize
    }
} catch {
    Write-Host "Error querying database: $_"
} finally {
    if ($conn.State -eq 'Open') { $conn.Close() }
}
