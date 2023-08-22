use crate::characters::Character;
use regex::Regex;
use std::collections::HashMap;

/// Identifies the title in the script text
/// # Errors
/// Returns 452 to be used as a status code that the frontend interprets as unable to find a title
pub fn parse_title(script_text: &String) -> Result<String, u32> {
    let re = Regex::new(r#"(?m)^Title: (.+)$"#).unwrap();
    let caps = re.captures(script_text.as_str());

    return match caps {
        Some(caps) => Ok(caps[1].to_string()), // Send back just the title of the play
        None => Err(452),                      // Error status number to send back
    };
}

/// Splits up the entire script text into chunks of what was separated by two new lines
pub fn parse_lines(script_text: &String) -> Vec<String> {
    // replace.() converts any windows style newlines (CRLF) to unix style (LF)
    // Different character's lines are separated by double \n
    return script_text
        .replace("\r\n", "\n")
        .split("\n\n")
        .map(String::from)
        .collect();
}

/// Identifies "valid" names to catch miss-identifications
fn is_name(name: &String) -> bool {
    let re = Regex::new(r"ACT|SCENE|START|THE PERSONS OF THE PLAY|EPILOGUE|THEATRE").unwrap();
    let invalid_name = re.is_match(&name);
    name == &name.to_uppercase() && name.len() > 1 && name.len() < 30 && !invalid_name
}

/// Identifies the characters and gets their line counts and speaks counts
pub fn parse_characters(line_chunks: Vec<String>) -> HashMap<String, Character> {
    let mut characters: HashMap<String, Character> = HashMap::new();

    // loop through the script and create/add to characters
    for chunk in line_chunks {
        let name: String;
        // Grab the name
        let potential_name_line: Vec<&str> = chunk.split(".").collect();
        // Check if the name has an honorific attached
        let re = Regex::new(r"^MR$|^MRS$|^MS$|^MISS$|^DR$|^JR$|^SR$|^PROF$|^REV$|^ST$|^COL$|^GEN$|^GOV$|^PRES$|^LT$").unwrap();
        if re.is_match(potential_name_line[0]) {
            name = format!("{}{}", potential_name_line[0], potential_name_line[1]);
        } else {
            name = format!("{}", potential_name_line[0]);
        }
        // Check that the name is legit, if it isn't move to the next chunk
        if !is_name(&name) {
            continue;
        }

        let mut curr_char = characters.entry(name.clone()).or_insert(Character {
            name: name.clone(),
            line_count: 0,
            speaks_count: 0,
            id: None,
            actor_id: None,
        });
        // Check whether lines start on the same line as the character name, or on the next line
        let lines_in_chunk: Vec<&str> = chunk.split("\n").collect();
        if lines_in_chunk.len() > name.len() {
            curr_char.line_count += lines_in_chunk.len() as u32;
        } else {
            // Minus one to account for the first line of the chunk that is just the name
            curr_char.line_count += lines_in_chunk.len() as u32 - 1;
        }
        curr_char.speaks_count += 1;
    }

    characters
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::characters::Character;
    use std::collections::HashMap;

    #[test]
    fn test_parse_title() {
        let sample = "AUTHOR: Steve\n\nTitle: Test 1\n\nACTOR 1.".to_string();
        let title = parse_title(&sample).unwrap();
        assert_eq!(title, "Test 1");

        let sample = "AUTHOR: Steve\n\nTITLE: Test 1\n\nACTOR 1.".to_string();
        let title = parse_title(&sample).unwrap_err();
        assert_eq!(title, 452)
    }

    #[test]
    fn test_parse_lines() {
        let sample = "Title: Test 1\n\nACTOR 1.\nSome test lines of a play\nthen some more lines that shall say things.\n\nACTOR 2.\nWhat a silly thing to say.".to_string();
        let line_chunks = parse_lines(&sample);
        let expected = vec![
            "Title: Test 1".to_string(),
            "ACTOR 1.\nSome test lines of a play\nthen some more lines that shall say things."
                .to_string(),
            "ACTOR 2.\nWhat a silly thing to say.".to_string(),
        ];
        assert_eq!(line_chunks, expected)
    }

    #[test]
    fn test_is_name() {
        let samples = vec![
            ("STEVE".to_string(), true),
            ("bob".to_string(), false),
            ("ACT".to_string(), false),
            ("SCENE".to_string(), false),
            ("A".to_string(), false),
            (
                "superduperlongnamethatismorethan30characters".to_string(),
                false,
            ),
        ];
        for test in samples {
            assert_eq!(is_name(&test.0), test.1)
        }
    }

    #[test]
    fn test_parse_characters() {
        let honorific_sample = vec!["DR. JEKYLL. \nJekyll had more than a father’s interest; Hyde had more than a son’s indifference.".to_string(),"HYDE. \nI am Mr.Hyde and also have things to say.\nMany things to say, indeed.".to_string()];
        let mut expected_with_honorific: HashMap<String, Character> = HashMap::new();
        expected_with_honorific.insert(
            "DR JEKYLL".to_string(),
            Character {
                name: "DR JEKYLL".to_string(),
                line_count: 1,
                speaks_count: 1,
                id: None,
                actor_id: None,
            },
        );
        expected_with_honorific.insert(
            "HYDE".to_string(),
            Character {
                name: "HYDE".to_string(),
                line_count: 2,
                speaks_count: 1,
                id: None,
                actor_id: None,
            },
        );
        let result = parse_characters(honorific_sample);
        assert_eq!(result, expected_with_honorific);

        let normal_sample = vec!["HARRY.\nWhat? Alright Malfoy,\nwhat is Pigfarts?".to_string(), "DRACO.\nOh! Never heard of it??\nHa. Figures.\nFamous Potter doesn’t even\nknow about Pigfarts!".to_string(), "HARRY.\nMalfoy, don’t act like you don’t\nwanna talk about it, that’s like\nthe ninth time you’ve mentioned\nPigfarts, what is Pigfarts?".to_string() ];
        let mut expected_normal: HashMap<String, Character> = HashMap::new();
        expected_normal.insert(
            "HARRY".to_string(),
            Character {
                name: "HARRY".to_string(),
                line_count: 6,
                speaks_count: 2,
                id: None,
                actor_id: None,
            },
        );
        expected_normal.insert(
            "DRACO".to_string(),
            Character {
                name: "DRACO".to_string(),
                line_count: 4,
                speaks_count: 1,
                id: None,
                actor_id: None,
            },
        );
        let result = dbg!(parse_characters(normal_sample));
        assert_eq!(result, expected_normal);
    }
}
