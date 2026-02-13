param(
    [Parameter(Mandatory=$true)]
    [string]$ProgramId
)

$file = Join-Path -Path (Get-Location) -ChildPath "programs\proof_of_play\src\lib.rs"
if (-Not (Test-Path $file)) {
    Write-Error "lib.rs not found at $file"; exit 1
}

$content = Get-Content -Raw -Path $file

# Replace the declare_id!("...") line
$pattern = 'declare_id!\(".*"\);'
$replacement = "declare_id!(\"$ProgramId\");"

if ($content -match $pattern) {
    $new = [regex]::Replace($content, $pattern, $replacement)
    Set-Content -Path $file -Value $new -Force
    Write-Host "Patched lib.rs with PROGRAM_ID $ProgramId"
} else {
    Write-Error "declare_id!(...) pattern not found in lib.rs"
}
