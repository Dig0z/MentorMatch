Postman integration tests:

Tested register endpoint with all expected parameter  -> success: user created
Tested login endpoint with all expected parameters of an existing user -> success: server response =
{
    "message": "Login succesful",
    "success": true,
    "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzY2Mzk5NTkyLCJleHAiOjE3NjY0MDMxOTJ9.nQy9L5mCvu9kHxM4M2iG56ryV5rb43RKtf-LMwshcbw"
}
