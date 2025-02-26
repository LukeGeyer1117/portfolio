	precision mediump float;

	attribute vec2 vertPosition;
	uniform mat4 uProjectionMatrix;

	void main()
	{
		gl_Position = uProjectionMatrix * vec4(vertPosition, 0.0, 1.0);
	}
