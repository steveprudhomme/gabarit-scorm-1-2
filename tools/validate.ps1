# [FR] Vérification XML hors ligne avec les schémas historiques livrés dans le projet.
# [EN] Offline XML validation using the historical schemas bundled with this project.
$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$SourceRoot = Join-Path $ProjectRoot 'src'
$script:ValidationErrors = [System.Collections.Generic.List[string]]::new()
$Handler = [System.Xml.Schema.ValidationEventHandler] {
    param($SourceObject, $EventArgs)
    $script:ValidationErrors.Add($EventArgs.Message)
}
$Settings = [System.Xml.XmlReaderSettings]::new()
$Settings.ValidationType = [System.Xml.ValidationType]::Schema
$Settings.DtdProcessing = [System.Xml.DtdProcessing]::Prohibit
$Settings.Schemas.XmlResolver = [System.Xml.XmlUrlResolver]::new()
$Settings.add_ValidationEventHandler($Handler)
# [FR] Charger les espaces de noms explicitement ; aucune requête web pendant la validation.
# [EN] Load namespaces explicitly; validation does not make web requests.
$null = $Settings.Schemas.Add('http://www.w3.org/XML/1998/namespace', (Join-Path $SourceRoot 'ims_xml.xsd'))
$null = $Settings.Schemas.Add('http://www.imsproject.org/xsd/imscp_rootv1p1p2', (Join-Path $SourceRoot 'imscp_rootv1p1p2.xsd'))
$null = $Settings.Schemas.Add('http://www.adlnet.org/xsd/adlcp_rootv1p2', (Join-Path $SourceRoot 'adlcp_rootv1p2.xsd'))
$Settings.Schemas.Compile()
foreach ($ManifestPath in @('src/imsmanifest.xml', 'examples/imsmanifest-multisco.xml')) {
    $Reader = [System.Xml.XmlReader]::Create((Join-Path $ProjectRoot $ManifestPath), $Settings)
    try { while ($Reader.Read()) { } } finally { $Reader.Dispose() }
}
if ($script:ValidationErrors.Count -gt 0) { throw ($script:ValidationErrors -join [Environment]::NewLine) }
Write-Output 'Deux manifestes valides selon les XSD locaux / Both manifests valid against local XSDs.'
