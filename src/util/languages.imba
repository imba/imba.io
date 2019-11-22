# This is the list of supported languages
# This structure is used in <select>
export var Languages = [
	{ value: "en", name: "English", location: "guide", 
	items: { HOME: 'home', LEARN: 'learn', DOCS: 'docs', COMMUNITY: 'community' } },

	{ value: "tr", name: "Turkish", location: "tr-TR/guide",
	items: { HOME: 'home', LEARN: 'learn', DOCS: 'docs', COMMUNITY: 'community' } }
]

# Use one the supported languages or default to English
export var def LanguageCode val
	if !val
		return "en"
	const v = val.toLowerCase()
	const code = Languages.find do |lang|
		v == lang:value
	code:value || "en"

# Locate the language guide base path from the value or default to English
export def LanguageGuide val
	if !val
		return "guide"
	const v = val.toLowerCase()
	const code = Languages.find do |lang|
		v == lang:value
	code ? code:location : "guide"
