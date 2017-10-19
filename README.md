# bigtree
<h3>Simple persistence and messaging for web. </h3>

<p>
HTTP POST/GET/DELETE to a path to Create/Update/Read/Delete, connecto a path over websocket to recieve notifications of path updates. 
</p>
<p>
Requires NodeJS v6.3+
</p>
<b>To install and run:</b>
<pre>
$ npm install bigtree -g
$ bigtree 3001
BigTree server started on port 3001
</pre>

<b>Usage examples:</b>
<pre>
GET http://localhost:3001/users/max/firstName: HTTP 404
POST "Maxim" http://localhost:3001/users/max/firstName: HTTP 200 "ok"
POST "Suponya" http://localhost:3001/users/max/lastName: HTTP 200 "ok"
GET http://localhost:3001/users/max/firstName: HTTP 200 "Maxim"
GET http://localhost:3001/users/max: HTTP 200 "{firstName:"Maxim", lastName:"Suponya"}
DELETE http://localhost:3001/users/max: HTTP 200 "ok"
GET http://localhost:3001/users/max/firstName: HTTP 404
</pre>
<p>
If during the above calls there was a websocket connection to ws://localhost:3001/users it would receive the following messages:
</p>
<pre>
/users/max/firstName
/users/max/lastName
/users/max
</pre>

<b>Security and authentication:</b>
<p>Paths can be secured for read/write/delete/listen operation. If a path is secured, requests must supply a correct 
jwt token (https://jwt.io/) in HTTP header "Authorization" like so:<p>
<pre>
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIvdXNlcnMvbWF4IjoicndkbCJ9.XyGDNETN88ncyFdsD-ZyC1XAVzd7QBN3M3rvO8VGSzU
</pre>
<p>A path can be secured by creating a file __r, __w, __d or __l for the corresponding operations of read, write, delete and listen.
Contents of the file will be used as the secret to verefy the token.</p>

<b>Possible use cases:</b>
<ul>
<li>Event driven architecture</li>
<li>Microservices orchestration</li>
<li>Integration</li>
<li>Configuration sotrage and management</li>
<li>Expose and persist an application model</li>
<li>Big data storage (cluster of bigtrees behind a load balancer)</li>
<li>A web app without any serverside code</li>
</ul>


<b>Apps that use bigtree for the server side persistence and messaging:</b>
<ul>
  <li>Chaff (<a href="https://chaff.xyz">https://chaff.xyz</a>), a location based web chat.</li>
</ul>


<b>Sequence of calls for a secure chat between two clients can be the following:</b>
<ul>
<li>Alice publicly shares a 'write only' token to /alice/public, it lets anyone write there but not read, delete or listen.</li>
<li>Bob posts his fully secured path and access token to /alice/public/bobs_chat_info</li>
<li>Alice was listening for updates to /alice/public so she knows Bob wants to chat.</li>
<li>Alice: POST "Hi Bob!" /bob/private/message1</li>
<li>Bob recives a websocket message '/bob/private/message1' so he knows there's a new message</li>
<li>Bob: GET /bob/private/message1 HTTP 200 "Hi Bob!"</li>
<li>Bob: POST "Hi Alice!" /bob/private/message2</li>
<li>Alice gets '/bob/private/message2' over websocket so she knows Bob replied</li>
<li>Alice: GET /bob/private/message2 HTTP 200 "Hi Alice!"</li>
</ul>
<p>All this time Eve couldn't know this chat took place and couldn't read/write/fake messages from/to Alice and Bob.</p>

</ul>
