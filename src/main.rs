use play_reading_party::run;

#[tokio::main]
async fn main() -> Result<(), std::io::Error> {
    run().await?.await
}
