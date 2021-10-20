# [preview=sm]
import 'util/styles'

imba.mount do
	# ---
	<a href='https://google.com' @click.prevent.log('prevented')> 'Google.com'