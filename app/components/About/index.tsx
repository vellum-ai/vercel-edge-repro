import { Box, useTheme } from "@mui/joy";
import { Link, Typography } from "@mui/material";
import ExternalCard from "./ExternalCard";

function AboutPage() {
  const theme = useTheme();
  return (
    <Box
      sx={{
        // breakpoing in mobile reduce padding to 4, otherwise 8:
        p: 3,
        gap: "12px",
        [theme.breakpoints.up("sm")]: {
          p: "64px",
          gap: "24px",
        },
        [theme.breakpoints.up("md")]: {
          gap: "32px",
        },
        [theme.breakpoints.up("lg")]: {
          gap: "40px",
        },
        display: "flex",
        justifyContent: "center",
        backgroundColor: theme.palette["indigo-25"],
        height: "100%",
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignContent="center"
        maxWidth="740px"
        gap="12px"
        sx={{
          [theme.breakpoints.up("sm")]: {
            gap: "24px",
          },
          [theme.breakpoints.up("md")]: {
            gap: "32px",
          },
          [theme.breakpoints.up("lg")]: {
            gap: "40px",
          },
        }}
      >
        <Box display="flex" flexDirection="column" justifyContent="center">
          <Typography
            textAlign="center"
            marginBottom={"16px"}
            sx={{
              fontFamily: "Nunito",
              fontSize: "20px",
              fontStyle: "normal",
              fontWeight: 700,
              lineHeight: "130%", // You can use a string or number here
              letterSpacing: "0.15px",
              color: theme.palette["gray-700"],
            }}
          >
            What is TeachingLab.ai?
          </Typography>
          <Typography
            textAlign="center"
            sx={{
              fontFamily: "Open Sans",
              fontSize: "16px",
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "150%", // You can use a string or number here
              letterSpacing: "0.15px",
              color: theme.palette["gray-700"],
            }}
          >
            TeachingLab.ai is a platform that empowers educators to build and
            share high-quality AI tools that improve educational outcomes. The
            platform is being developed within the Teaching Lab Coherence
            Innovation Studio.
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" justifyContent="center">
          <Typography
            textAlign="center"
            marginBottom={"16px"}
            sx={{
              fontFamily: "Nunito",
              fontSize: "20px",
              fontStyle: "normal",
              fontWeight: 700,
              lineHeight: "130%", // You can use a string or number here
              letterSpacing: "0.15px",
              color: theme.palette["gray-700"],
            }}
          >
            What is the Teaching Lab Coherence Innovation Studio?
          </Typography>
          <Typography
            textAlign="center"
            marginBottom={"16px"}
            sx={{
              fontFamily: "Open Sans",
              fontSize: "16px",
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "150%", // You can use a string or number here
              letterSpacing: "0.15px",
              color: theme.palette["gray-700"],
            }}
          >
            The{" "}
            <Link
              href="https://www.teachinglab.org/fellowship"
              sx={{
                fontWeight: "700",
                color: theme.palette["blue-600"],
                cursor: "pointer",
                textDecoration: "none",
              }}
              target="_blank"
            >
              Coherence Innovation Studio
            </Link>{" "}
            is a new unit of{" "}
            <Link
              href="https://www.teachinglab.org/"
              sx={{
                fontWeight: "700",
                color: theme.palette["blue-600"],
                cursor: "pointer",
                textDecoration: "none",
              }}
              target="_blank"
            >
              Teaching Lab
            </Link>
            , a leading provider of educator coaching and professional outcomes
            across the US. We created the Studio to incubate high-impact ideas
            made possible by the dramatic progress in generative AI.
          </Typography>
          <Typography
            textAlign="center"
            marginBottom={"16px"}
            sx={{
              fontFamily: "Open Sans",
              fontSize: "16px",
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "150%", // You can use a string or number here
              letterSpacing: "0.15px",
              color: theme.palette["gray-700"],
            }}
          >
            Here are some of the other projects that we’re currently working on:
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: "40px",
            flexDirection: {
              xs: "column",
              md: "row",
            },
            alignItems: "center",
          }}
        >
          <ExternalCard
            title="Writing Pathways"
            description="Writing Pathways is a scaffolded and research-based sequence for writing instruction in all content areas for 3rd-10th grade. It’s a set of recommended writing skills that can be integrated into a teacher’s current curriculum."
            url="https://wptool.teachinglab.org"
            imageUrl="https://wptool.teachinglab.org/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FaboutPageHand.a7d87332.png&w=828&q=75"
          />
          <ExternalCard
            title="Podsie"
            description="Podsie is a free and personalized automated learning tool built by teachers that helps students remember what they learned. It’s built on research-backed strategies of spacing, interleaving, and retrieval."
            url="https://www.podsie.org"
            imageUrl="https://uploads-ssl.webflow.com/6334c2d1bed4184d946cd809/633747dc03a3f01e2369784f_Podsie-Full%20Logo-Green-p-500.png"
          />
        </Box>
      </Box>
    </Box>
  );
}

export default AboutPage;
