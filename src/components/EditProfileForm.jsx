export default function EditProfileForm({ fetcher, profileInfo }) {
    return (
        <fetcher.Form method="post">
            <label htmlFor="nameInput">Change name</label>
            <input
                className="border border-slate-500 block"
                type="text"
                defaultValue={profileInfo.name}
                name="name"
                id="nameInput"
            />
            <label htmlFor="bio">Bio</label>
            <textarea
                name="bio"
                id="bio"
                cols="30"
                rows="10"
                className="border border-slate-500 block"
            >
                {profileInfo.bio}
            </textarea>
            <label htmlFor="twitterInput">Twitter username</label>
            <input
                className="border border-slate-500 block"
                type="text"
                defaultValue={profileInfo.twitter}
                name="twitter"
                id="twitterInput"
            />
            <button className="block border border-sky-500" type="submit">
                Submit
            </button>
        </fetcher.Form>
    );
}
