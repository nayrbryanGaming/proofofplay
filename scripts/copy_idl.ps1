param()

$src = Join-Path -Path (Get-Location) -ChildPath "target\idl\proof_of_play.json"
$dest = Join-Path -Path (Get-Location) -ChildPath "app\src\components\idl.json"

if (-Not (Test-Path $src)) {
    Write-Error "IDL not found at $src. Run `anchor build` first."; exit 1
}

Copy-Item -Path $src -Destination $dest -Force
Write-Host "Copied IDL to $dest"
