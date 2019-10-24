// eslint-disable-next-line no-unused-vars
function showAnswer() {
  const questionId = $('#question-id').val();
  const answer = $('input[type="radio"]:checked').val();
  fetch('/random-math-question', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ questionId, answer }),
  })
    .then(res => res.json())
    .then(({ solved }) => {
      if (solved) {
        $('#solved').show();
        $('#incorrect').hide();
      } else {
        $('#incorrect').show();
        $('#solved').hide();
      }
    });
}
