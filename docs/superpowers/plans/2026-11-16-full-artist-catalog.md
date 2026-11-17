# Full artist catalog plan

Goal: Browse all available credited songs/releases from the artist page.
Architecture: Occipital scans paged Spotify releases and their tracks; Next.js validates and appends independent song/release batches. Shared interface below; independent backend and web work use separate repository ownership, then a fresh review.
Spec: docs/superpowers/specs/2026-11-16-full-artist-catalog-design.md
Constraints: invite-only, preserve member data/manualposting, both themes; GCP beatbrain-dev/us-central1 explicit; push versiontag beforewebdeployment; no secrets inGit/logs/uploads.

## Contract
GET /artist?spotifyId=ID&section=all|songs|releases&cursor=RELEASE.TRACK&offset=N
Default sectionall, cursor0.0, offset0. Cursor two canonical nonnegative integers <=1000000 each, offset integer0..1000000. Reject repeated/invalid parameters. section=songs usescursor; releases usesoffset. all only initial0/0.0. Artistidentity required (existing shape).
Response always:
{artist,tracks:[{id,name,artist,thumb,album_id,album_name,release_date}],albums:[{id,name,image,url,release_date,album_type,album_group}],next_cursor:string|null,next_release_offset:number|null,release_total:number,scanned_releases:number,unavailable:Array<'tracks'|'albums'>,next_offset:null}
Songs<=24, releases<=24. next_offset null preserves safe oldclientstop untilnewwebships. Tracks exactSpotifyartistID, validtrackID, canonicalSpotifylinks/images; othercompilationartistsexcluded. sourceartistalbums includes album,single,appears_on,compilation, marketUS. Nosearchcalls.
Songs scan <=3releases and<=one50trackpage perrelease perrequest. Stop after24 qualifyingunique tracks, resume at exact raw offset consumed; if albumtrackpage continues resume same release. Cursor advances across excluded/duplicate tracks andemptyreleases, does not skipfailed source pages. Partial failure retains returned songs and pointsnext_cursor to failedposition; unavailabletracks prevents caching and auto continuation. releasesoffset is independent. release_total fromsource, scanned_releases absolute completedrelease count (partialrelease notcounted). Totalcount is releaseentries includingeditions, notuniquesongs.
6second shared deadline, max8active loads, bounded5mincache no partialfailurecache. Reuseexistinghandlercachewithkeyincludingsection/cursor/offset, cap128entries128KiB. Initialreleasepage24 mayfeedfirst3catalogreleases toavoidduplicatedlookup; implementationcanusesmallhelper. Cachecomplete responsesonly. No unboundedbackgroundjobs.

## Tasks
1. Go: testsfailfirst for shortsearchbutfullalbumtracks, >24songcontinuation midalbum, >50albumtrackcontinuation, 770releasepagination, exactidentity/compilationfilter, emptyreleaseprogress, duplicateIDs, laterfailurecursorretry, deadline/cancel/cachekeyisolation. Replaceartistsearchload, preservedefaultsearchendpoint. Fullgo test/vet/build; independentreview.
2. Web: libartist types/parser acceptsnewfields withboundedarrays/cursors, private/api/artist validatesparametersandkeepsdisconnectcancellation. Song/releasepaginationindependent; appenddedupeIDs; fullcatalogbuttonsequentiallyloadswithStopandprogress; stoponfailure/session/routechange. Two independent confirmed states/errors/controls; no backgroundretry. Showloadedtrackcount plusreleaseschecked, releasesloaded/total; albumcontext ontracks. UnitAPI/parsertests, browserpagination/error/stale/cancel andboth themes320/390/1440.
3. Release: Go candidate no traffic, verifyrealPharrellbatches andotherartist, countsmuchgreaterthan5, verifylatealbumtracks andappearances. Webbuild/tests. Version1.12.0ifunused andtagfirst. Livemember sign-in/song/post/profile andcatalogload; cleanupown testdata, tempservers, candidateURLs. Originalcheckoutsuntouched.
