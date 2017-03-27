#!/bin/sh
HOST=http://localhost:8888

function usage {
	echo "$0 [-E] <file>"
	echo
	echo "-E encrypt the file before upload"
	exit 1
}

function upload {
	local tfile=$(mktemp)
	echo "Uploading file $FILENAME: "
	curl --progress-bar -F file=@$FILENAME $HOST -o $tfile

	if [[ ! $? -eq 0 ]]; then
		echo "Upload failed"
		exit 1
    fi

	local delete_id=$(cat $tfile | tr -d {}\" | tr , "\n" | tr : "\t" | grep -E ^delete_id | cut -f2)
	local id=$(cat $tfile | tr -d {}\" | tr , "\n" | tr : "\t" | grep -E ^id | cut -f2)

	echo "Download URL: $HOST/$id"
	echo "Delete: curl -X DELETE $HOST/$id/$delete_id"
	rm $tfile
}

if [[ $# -eq 0 ]]; then
	usage
fi

FILENAME=${!#}

if [[ ! -e $FILENAME ]]; then
	echo "file $FILENAME not found"
	exit 1
fi

if [[ $# -eq 2 ]] &&  [[ $1 == "-E" ]]; then
	type gpg >/dev/null 2>&1 || { echo >&2 "gpg needs to be installed for encryption to work"; exit 1; }
	gpg --symmetric $FILENAME || exit 1
	FILENAME=$FILENAME".gpg"
fi

upload
