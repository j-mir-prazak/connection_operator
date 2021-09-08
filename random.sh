#!/bin/bash

function random {

CHARS="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"

STRING="";
for i in {1..16} ; do
        RANDOM_NUM=${RANDOM};
        POSITION=$((RANDOM_NUM%${#CHARS}));
        R="${CHARS:POSITION:1}";
        STRING=$STRING$R;
done
echo "$STRING";

}

function generateRandom {

FREE=0;
LOOP=0;

#echo $(($FREE < 1));

while [[ $FREE < 1 ]]; do

  #echo "while"
  R=$(random);
  #echo "TESTING $R"

  if [[ ! -f ./random/"$R" ]]; then
    FREE=1;
    echo "FREE $R"
    touch ./random/"$R"
    break;
  fi


  LOOP=$(($LOOP+1))
  #echo "LOOP:"$LOOP;
  #echo "BIGGER:"$(($LOOP > 10 ));

  if (( $LOOP > 9 )); then
    echo "IMPOSSIBLE $R";
    FREE=1;
    break;
  fi

done

#sleep 0.1

}
#echo "-----------"
output="$(random)"
for i in {0..2}; do output=$output-$(random); done
echo "$output"
